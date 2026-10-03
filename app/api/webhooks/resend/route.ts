import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { runMessageReceivedAutomations } from "@/app/utils/automation-engine";

import { createAdminClient } from "@/app/utils/supabase/admin";
import { createActivityLog } from "@/app/utils/activity-log";

export const runtime = "nodejs";

function getReceivingResendClient() {
  const apiKey = process.env.RESEND_RECEIVING_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_RECEIVING_API_KEY is not configured."
    );
  }

  return new Resend(apiKey);
}

function getWebhookSecret() {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "RESEND_WEBHOOK_SECRET is not configured."
    );
  }

  return webhookSecret;
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);

  return (match?.[1] ?? value).trim().toLowerCase();
}

function getHeader(
  headers: Record<string, string> | null | undefined,
  name: string
) {
  const entry = Object.entries(headers ?? {}).find(
    ([key]) => key.toLowerCase() === name.toLowerCase()
  );

  return entry?.[1]?.trim() || null;
}


function cleanIncomingEmailText(text: string) {
  let cleaned = text.replace(/\r\n/g, "\n").trim();

  const quotedSectionIndex = cleaned.search(
    /(?:^|\n)\s*(?:On .+ wrote:|Am .+ schrieb .+:|-----Original Message-----)\s*(?:\n|$)/i
  );

  if (quotedSectionIndex !== -1) {
    cleaned = cleaned.slice(0, quotedSectionIndex).trim();
  }

  const inlineQuotedSectionIndex = cleaned.search(
    /\sOn .+ wrote:\s*>/i
  );

  if (inlineQuotedSectionIndex !== -1) {
    cleaned = cleaned
      .slice(0, inlineQuotedSectionIndex)
      .trim();
  }

  return cleaned;
}


export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();

    const resend = getReceivingResendClient();

    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: getWebhookSecret(),
    });

    if (event.type !== "email.received") {
      return NextResponse.json({ received: true });
    }

    const { data: email, error: emailError } =
      await resend.emails.receiving.get(
        event.data.email_id
      );

    if (emailError || !email) {
      console.error(
        "Failed to retrieve received email:",
        emailError
      );

      return NextResponse.json(
        { error: "Could not retrieve received email." },
        { status: 500 }
      );
    }

    const admin = createAdminClient();

    const recipientAddresses = Array.from(
      new Set(
        [
          ...(email.to ?? []),
          ...(email.received_for ?? []),
        ]
          .map((address) => extractEmailAddress(address))
          .filter(Boolean)
      )
    );

    if (recipientAddresses.length === 0) {
      console.error(
        "Received email has no valid recipient address."
      );

      return NextResponse.json(
        { error: "Could not determine inbound mailbox." },
        { status: 200 }
      );
    }

    const {
      data: inboundMailbox,
      error: mailboxError,
    } = await admin
      .from("inbound_mailboxes")
      .select("id, user_id, email_address")
      .in("email_address", recipientAddresses)
      .maybeSingle();

    if (mailboxError) {
      console.error(
        "Failed to resolve inbound mailbox:",
        mailboxError
      );

      return NextResponse.json(
        { error: "Could not resolve inbound mailbox." },
        { status: 500 }
      );
    }

    if (!inboundMailbox) {
      console.warn(
        "Received email does not belong to a known inbound mailbox.",
        {
          to: recipientAddresses,
        }
      );

      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const inReplyTo = getHeader(
      email.headers,
      "In-Reply-To"
    );

    const referencesHeader = getHeader(
      email.headers,
      "References"
    );

    const emailReferences = referencesHeader
      ? referencesHeader
          .split(/\s+/)
          .map((reference) => reference.trim())
          .filter(Boolean)
      : null;

    let clientId: number | null = null;
    let projectId: number | null = null;

    if (inReplyTo) {
      const {
        data: originalMessage,
        error: originalMessageError,
      } = await admin
        .from("messages")
        .select("client_id, project_id")
        .eq("user_id", inboundMailbox.user_id)
        .eq("provider_message_id", inReplyTo)
        .maybeSingle();

      if (originalMessageError) {
        console.error(
          "Failed to resolve original message:",
          originalMessageError
        );
      }

      if (originalMessage) {
        clientId = originalMessage.client_id;
        projectId = originalMessage.project_id;
      }
    }

    if (!clientId) {
      const senderEmail = extractEmailAddress(email.from);

      const {
        data: client,
        error: clientError,
      } = await admin
        .from("clients")
        .select("id")
        .eq("user_id", inboundMailbox.user_id)
        .ilike("email", senderEmail)
        .limit(1)
        .maybeSingle();

      if (clientError) {
        console.error(
          "Failed to resolve client from sender:",
          clientError
        );

        return NextResponse.json(
          { error: "Could not resolve sender." },
          { status: 500 }
        );
      }

      if (client) {
        clientId = client.id;
      }
    }

    if (!clientId) {
      console.warn(
        "Received email could not be matched to a client.",
        {
          from: email.from,
          to: recipientAddresses,
        }
      );

      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const content = cleanIncomingEmailText(
  email.text?.trim() ?? ""
);

    if (!content) {
      console.warn(
        "Received email does not contain a plain-text body.",
        {
          emailId: email.id,
        }
      );

      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const {
      data: insertedMessage,
      error: insertError,
    } = await admin
      .from("messages")
      .insert({
        user_id: inboundMailbox.user_id,
        client_id: clientId,
        project_id: projectId,
        direction: "incoming",
        content,
        status: "received",
        created_at: email.created_at,
        provider_email_id: email.id,
        provider_message_id: email.message_id,
        in_reply_to: inReplyTo,
        email_references: emailReferences,
      })
      .select(
        "id, client_id, project_id, direction, content, status, created_at"
      )
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        console.log(
          "Received email already exists. Ignoring duplicate webhook.",
          {
            providerEmailId: email.id,
            providerMessageId: email.message_id,
          }
        );

        return NextResponse.json({
          received: true,
          duplicate: true,
        });
      }

      console.error(
        "Failed to save received message:",
        insertError
      );

      return NextResponse.json(
        { error: "Could not save received message." },
        { status: 500 }
      );
    }

    await createActivityLog({
      userId: inboundMailbox.user_id,
      eventType: "message.received",
      message: "Incoming email received.",
      clientId,
      projectId,
      messageId: insertedMessage.id,
      metadata: {
        provider: "resend",
        providerEmailId: email.id,
        providerMessageId: email.message_id,
        inReplyTo,
        subject: email.subject,
      },
    });


    try {
  await runMessageReceivedAutomations({
    userId: inboundMailbox.user_id,
    messageId: insertedMessage.id,
    clientId,
    projectId,
    content,
  });
} catch (error) {
  console.error(
    "[Resend Webhook] Automation processing failed after message was saved:",
    {
      messageId: insertedMessage.id,
      error,
    }
  );
}


    console.log("Incoming message saved.", {
      messageId: insertedMessage.id,
      clientId,
      projectId,
      providerEmailId: email.id,
      providerMessageId: email.message_id,
    });

    return NextResponse.json({
      received: true,
      message: insertedMessage,
    });
  } catch (error) {
    console.error(
      "Resend webhook processing failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid webhook." },
      { status: 400 }
    );
  }
}