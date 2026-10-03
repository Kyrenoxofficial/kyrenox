import "server-only";

import { Resend } from "resend";

import { createActivityLog } from "@/app/utils/activity-log";
import { getOrCreateInboundMailbox } from "@/app/utils/inbound-mailbox";
import { createAdminClient } from "@/app/utils/supabase/admin";

export type SendDraftMessageSource =
  | "manual_review"
  | "automation_auto_send";

type SendDraftMessageInput = {
  userId: string;
  messageId: number;
  source: SendDraftMessageSource;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getFromEmail() {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  return fromEmail;
}

export async function sendDraftMessage({
  userId,
  messageId,
  source,
}: SendDraftMessageInput) {
  const admin = createAdminClient();

  const { data: message, error: messageError } = await admin
    .from("messages")
    .select(
      `
        id,
        client_id,
        project_id,
        direction,
        content,
        status,
        clients (
          name,
          email
        ),
        projects (
          name
        )
      `
    )
    .eq("id", messageId)
    .eq("user_id", userId)
    .single();

  if (messageError || !message) {
    throw new Error("Message not found.");
  }

  if (message.direction !== "outgoing") {
    throw new Error("Only outgoing messages can be sent.");
  }

  if (message.status !== "draft") {
    throw new Error("Only draft messages can be sent.");
  }

  const client = Array.isArray(message.clients)
    ? message.clients[0]
    : message.clients;

  const project = Array.isArray(message.projects)
    ? message.projects[0]
    : message.projects;

  const content = message.content.trim();

  if (!content) {
    throw new Error("The message cannot be empty.");
  }

  if (!client?.email) {
    throw new Error(
      "The client does not have an email address."
    );
  }

  const resend = getResendClient();
  const fromEmail = getFromEmail();
  const inboundMailbox =
    await getOrCreateInboundMailbox(userId);

  const subject = project?.name
    ? `Re: ${project.name}`
    : "Message from Kyrenox";

  const { data, error: resendError } =
    await resend.emails.send(
      {
        from: fromEmail,
        to: [client.email],
        subject,
        text: content,
        replyTo: inboundMailbox.email_address,
      },
      {
        idempotencyKey: `message-send/${message.id}`,
      }
    );

  if (resendError || !data?.id) {
    await admin
      .from("messages")
      .update({ status: "failed" })
      .eq("id", message.id)
      .eq("user_id", userId);

    await createActivityLog({
      userId,
      eventType: "message.failed",
      message: "Message sending failed.",
      clientId: message.client_id,
      projectId: message.project_id,
      messageId: message.id,
      metadata: {
        provider: "resend",
        source,
        error:
          resendError?.message ??
          "Unknown Resend error.",
      },
    });

    throw new Error(
      "The message could not be sent."
    );
  }

  const {
    data: updatedMessage,
    error: updateError,
  } = await admin
    .from("messages")
    .update({
      status: "sent",
      provider_email_id: data.id,
      reply_to_address:
        inboundMailbox.email_address,
    })
    .eq("id", message.id)
    .eq("user_id", userId)
    .select(
      "id, client_id, project_id, direction, content, status, created_at"
    )
    .single();

  if (updateError || !updatedMessage) {
    console.error(
      "Message sent but status update failed:",
      updateError
    );

    throw new Error(
      "The message was sent, but its status could not be updated."
    );
  }

  await createActivityLog({
    userId,
    eventType: "message.sent",
    message: "Message sent successfully.",
    clientId: message.client_id,
    projectId: message.project_id,
    messageId: message.id,
    metadata: {
      provider: "resend",
      resendId: data.id,
      source,
    },
  });

  return updatedMessage;
}