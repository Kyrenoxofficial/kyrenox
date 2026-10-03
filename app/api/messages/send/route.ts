import "server-only";

import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createActivityLog } from "@/app/utils/activity-log";
import { createClient } from "@/app/utils/supabase/server";
import { getOrCreateInboundMailbox } from "@/app/utils/inbound-mailbox";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const messageId = Number(body.messageId);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json(
        { error: "A valid message ID is required." },
        { status: 400 }
      );
    }

    const { data: message, error: messageError } = await supabase
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
      .eq("user_id", user.id)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 }
      );
    }

    if (message.direction !== "outgoing") {
      return NextResponse.json(
        { error: "Only outgoing messages can be sent." },
        { status: 400 }
      );
    }

    if (message.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft messages can be sent." },
        { status: 400 }
      );
    }

    const client = Array.isArray(message.clients)
      ? message.clients[0]
      : message.clients;

    const project = Array.isArray(message.projects)
      ? message.projects[0]
      : message.projects;

    const content = message.content.trim();

    if (!content) {
      return NextResponse.json(
        { error: "The message cannot be empty." },
        { status: 400 }
      );
    }

    if (!client?.email) {
      return NextResponse.json(
        { error: "The client does not have an email address." },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    const fromEmail = getFromEmail();

    const subject = project?.name
      ? `Re: ${project.name}`
      : "Message from Kyrenox";

      const inboundMailbox = await getOrCreateInboundMailbox(user.id);
    const { data, error: resendError } = await resend.emails.send(
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
      await supabase
        .from("messages")
        .update({ status: "failed" })
        .eq("id", message.id)
        .eq("user_id", user.id);

      await createActivityLog({
        userId: user.id,
        eventType: "message.failed",
        message: "Message sending failed.",
        clientId: message.client_id,
        projectId: message.project_id,
        messageId: message.id,
        metadata: {
          provider: "resend",
          error: resendError?.message ?? "Unknown Resend error.",
        },
      });

      return NextResponse.json(
        { error: "The message could not be sent." },
        { status: 502 }
      );
    }



    

    const { data: updatedMessage, error: updateError } = await supabase
  .from("messages")
  .update({
    status: "sent",
    provider_email_id: data.id,
    reply_to_address: inboundMailbox.email_address,
  })
  .eq("id", message.id)
  .eq("user_id", user.id)
  .select(
    "id, client_id, project_id, direction, content, status, created_at"
  )
  .single();

    if (updateError || !updatedMessage) {
      console.error(
        "Message sent but status update failed:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "The message was sent, but its status could not be updated.",
        },
        { status: 500 }
      );
    }

    await createActivityLog({
      userId: user.id,
      eventType: "message.sent",
      message: "Message sent successfully.",
      clientId: message.client_id,
      projectId: message.project_id,
      messageId: message.id,
      metadata: {
        provider: "resend",
        resendId: data.id,
      },
    });

    return NextResponse.json({
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Failed to send message:", error);

    return NextResponse.json(
      {
        error: "The message could not be sent.",
      },
      { status: 500 }
    );
  }
}