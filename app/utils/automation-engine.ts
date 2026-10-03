import "server-only";

import { createActivityLog } from "@/app/utils/activity-log";
import { generateAutomationReply } from "@/app/utils/automation-ai";
import { checkAutomationSecurity } from "@/app/utils/automation-security";
import { createAdminClient } from "@/app/utils/supabase/admin";
import { sendDraftMessage } from "@/app/utils/send-draft-message";

type MessageReceivedAutomationInput = {
  userId: string;
  messageId: number;
  clientId: number;
  projectId: number | null;
  content: string;
};

type AutomationCondition = {
  keyword?: string;
};

type Automation = {
  id: number;
  name: string;
  trigger: string | null;
  status: string;
  mode: "draft" | "review" | "auto_send";
  conditions: AutomationCondition;
  client_id: number | null;
  project_id: number | null;
};

function matchesCondition(
  automation: Automation,
  content: string
) {
  const keyword = automation.conditions?.keyword?.trim();

  if (!keyword) {
    return true;
  }

  return content
    .toLowerCase()
    .includes(keyword.toLowerCase());
}

function matchesScope(
  automation: Automation,
  clientId: number,
  projectId: number | null
) {
  if (
    automation.client_id !== null &&
    automation.client_id !== clientId
  ) {
    return false;
  }

  if (
    automation.project_id !== null &&
    automation.project_id !== projectId
  ) {
    return false;
  }

  return true;
}

export async function runMessageReceivedAutomations(
  input: MessageReceivedAutomationInput
) {
  const admin = createAdminClient();

  const { data: automations, error } = await admin
    .from("automations")
    .select(
      `
        id,
        name,
        trigger,
        status,
        mode,
        conditions,
        client_id,
        project_id
      `
    )
    .eq("user_id", input.userId);

  if (error) {
    throw new Error(
      `Failed to load automations: ${error.message}`
    );
  }

  const candidateAutomations = (
    (automations ?? []) as Automation[]
  ).filter((automation) => {
    const trigger =
  automation.trigger
    ?.replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim() ?? "";
    const status = automation.status?.trim() ?? "";

    return (
      trigger === "message.received" &&
      status === "active"
    );
  });

 const matchingAutomations =
  candidateAutomations.filter((automation) => {
    return (
      matchesScope(
        automation,
        input.clientId,
        input.projectId
      ) &&
      matchesCondition(
        automation,
        input.content
      )
    );
  });

const autoSendAutomations =
  matchingAutomations.filter(
    (automation) => automation.mode === "auto_send"
  );

const hasAutoSendConflict =
  autoSendAutomations.length > 1;

for (const automation of matchingAutomations) {
  if (
  automation.mode === "auto_send" &&
  hasAutoSendConflict
) {
  await createActivityLog({
    userId: input.userId,
    eventType: "automation.conflict_blocked",
    message:
      "Auto-send blocked because multiple matching auto-send automations were found.",
    clientId: input.clientId,
    projectId: input.projectId,
    messageId: input.messageId,
    metadata: {
      automationId: automation.id,
      conflictingAutomationIds:
        autoSendAutomations.map(
          (item) => item.id
        ),
    },
  });

  console.warn(
    `[Automation Engine] Auto-send blocked because multiple matching auto-send automations were found.`,
    {
      automationId: automation.id,
      conflictingAutomationIds:
        autoSendAutomations.map(
          (item) => item.id
        ),
    }
  );

  continue;
}


    await createActivityLog({
      userId: input.userId,
      eventType: "automation.triggered",
      message: `Automation "${automation.name}" triggered.`,
      clientId: input.clientId,
      projectId: input.projectId,
      messageId: input.messageId,
      metadata: {
        automationId: automation.id,
        trigger: automation.trigger,
        mode: automation.mode,
      },
    });

    const {
      data: client,
      error: clientError,
    } = await admin
      .from("clients")
      .select("id, name")
      .eq("id", input.clientId)
      .eq("user_id", input.userId)
      .single();

    if (clientError || !client) {
      console.error(
        "[Automation Engine] Failed to load client context:",
        clientError
      );

      continue;
    }

    let projectName: string | null = null;

    if (input.projectId !== null) {
      const {
        data: project,
        error: projectError,
      } = await admin
        .from("projects")
        .select("id, name")
        .eq("id", input.projectId)
        .eq("user_id", input.userId)
        .single();

      if (projectError || !project) {
        console.error(
          "[Automation Engine] Failed to load project context:",
          projectError
        );

        continue;
      }

      projectName = project.name;
    }

    const {
      data: previousMessages,
      error: conversationError,
    } = await admin
      .from("messages")
      .select(
        "direction, content, created_at"
      )
      .eq("user_id", input.userId)
      .eq("client_id", input.clientId)
      .in("status", ["received", "sent"])
      .neq("id", input.messageId)
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    if (conversationError) {
      console.error(
        "[Automation Engine] Failed to load conversation:",
        conversationError
      );

      continue;
    }

    const conversationHistory = [
      ...(previousMessages ?? []),
    ]
      .reverse()
      .map((message) => {
        const speaker =
          message.direction === "incoming"
            ? "Client"
            : "Freelancer";

        return `${speaker}: ${message.content}`;
      })
      .join("\n\n");

    try {
      const generatedReply =
        await generateAutomationReply({
          clientName: client.name,
          projectName,
          conversationHistory,
          latestMessage: input.content,
        });

      const securityResult =
        checkAutomationSecurity({
          incomingMessage: input.content,
          generatedReply,
        });

      await createActivityLog({
        userId: input.userId,
        eventType: "ai.reply.generated",
        message: "AI reply generated.",
        clientId: input.clientId,
        projectId: input.projectId,
        messageId: input.messageId,
        metadata: {
          automationId: automation.id,
          mode: automation.mode,
        },
      });

      await createActivityLog({
        userId: input.userId,
        eventType: "automation.security_checked",
        message:
          "Automation security check completed.",
        clientId: input.clientId,
        projectId: input.projectId,
        messageId: input.messageId,
        metadata: {
          automationId: automation.id,
          decision: securityResult.decision,
          flags: securityResult.flags,
        },
      });

      const {
        data: draftMessage,
        error: draftError,
      } = await admin
        .from("messages")
        .insert({
          user_id: input.userId,
          client_id: input.clientId,
          project_id: input.projectId,
          direction: "outgoing",
          content: generatedReply,
          status: "draft",
        })
        .select(
          `
            id,
            client_id,
            project_id,
            direction,
            content,
            status,
            created_at
          `
        )
        .single();

      if (draftError || !draftMessage) {
        console.error(
          "[Automation Engine] Failed to create AI draft:",
          draftError
        );

        continue;
      }

      await createActivityLog({
        userId: input.userId,
        eventType: "message.draft_created",
        message: "AI reply draft created.",
        clientId: input.clientId,
        projectId: input.projectId,
        messageId: draftMessage.id,
        metadata: {
          automationId: automation.id,
          sourceMessageId: input.messageId,
          mode: automation.mode,
          security: {
            decision: securityResult.decision,
            flags: securityResult.flags,
          },
        },
      });


      const { error: lastRunError } = await admin
  .from("automations")
  .update({
    last_run_at: new Date().toISOString(),
  })
  .eq("id", automation.id)
  .eq("user_id", input.userId);

if (lastRunError) {
  console.error(
    `[Automation Engine] Failed to update last_run_at for automation ${automation.id}:`,
    lastRunError
  );
}


      if (automation.mode !== "auto_send") {
        continue;
      }

      if (securityResult.decision !== "allow") {
        continue;
      }

      try {
        await sendDraftMessage({
          userId: input.userId,
          messageId: draftMessage.id,
          source: "automation_auto_send",
        });
      } catch (error) {
        console.error(
          `[Automation Engine] Auto-send failed for automation ${automation.id}:`,
          error
        );
      }
    } catch (error) {
      console.error(
        `[Automation Engine] AI generation failed for automation ${automation.id}:`,
        error
      );
    }
  }

  return matchingAutomations;
}