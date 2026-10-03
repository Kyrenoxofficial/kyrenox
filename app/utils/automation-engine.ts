import "server-only";

import { createActivityLog } from "@/app/utils/activity-log";
import { createAdminClient } from "@/app/utils/supabase/admin";

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
    .eq("user_id", input.userId)
    .eq("trigger", "message.received")
    .eq("status", "active");

  if (error) {
    throw new Error(
      `Failed to load message.received automations: ${error.message}`
    );
  }

  const candidateAutomations = (automations ?? []) as Automation[];

console.log("[Automation Engine] Candidates:", {
  messageId: input.messageId,
  clientId: input.clientId,
  projectId: input.projectId,
  count: candidateAutomations.length,
  automationIds: candidateAutomations.map(
    (automation) => automation.id
  ),
});

const matchingAutomations = candidateAutomations.filter(
  (automation) => {
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
  }
);

console.log("[Automation Engine] Matching:", {
  messageId: input.messageId,
  count: matchingAutomations.length,
  automationIds: matchingAutomations.map(
    (automation) => automation.id
  ),
});

  for (const automation of matchingAutomations) {
    console.log("[Automation Engine] Logging trigger:", automation.id);
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
  }

  return matchingAutomations;
}