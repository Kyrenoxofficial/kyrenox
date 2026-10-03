import "server-only";

import { randomBytes } from "crypto";
import { createAdminClient } from "@/app/utils/supabase/admin";

type InboundMailbox = {
  id: number;
  user_id: string;
  routing_token: string;
  email_address: string;
  created_at: string;
};

function getInboundDomain() {
  const domain = process.env.RESEND_INBOUND_DOMAIN;

  if (!domain) {
    throw new Error(
      "RESEND_INBOUND_DOMAIN is not configured."
    );
  }

  return domain;
}

export async function getOrCreateInboundMailbox(
  userId: string
): Promise<InboundMailbox> {
  const supabase = createAdminClient();
  const domain = getInboundDomain();

  const { data: existingMailbox, error: lookupError } =
    await supabase
      .from("inbound_mailboxes")
      .select(
        "id, user_id, routing_token, email_address, created_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Could not load inbound mailbox: ${lookupError.message}`
    );
  }

  if (existingMailbox) {
    return existingMailbox;
  }

  const routingToken = randomBytes(24).toString("hex");
  const emailAddress = `r-${routingToken}@${domain}`;

  const { data: createdMailbox, error: createError } =
    await supabase
      .from("inbound_mailboxes")
      .insert({
        user_id: userId,
        routing_token: routingToken,
        email_address: emailAddress,
      })
      .select(
        "id, user_id, routing_token, email_address, created_at"
      )
      .single();

  if (!createError && createdMailbox) {
  return createdMailbox;
}

if (createError?.code !== "23505") {
  throw new Error(
    `Could not create inbound mailbox: ${
      createError?.message ?? "Unknown error."
    }`
  );
}

const { data: concurrentMailbox, error: concurrentLookupError } =
  await supabase
    .from("inbound_mailboxes")
    .select(
      "id, user_id, routing_token, email_address, created_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

if (concurrentLookupError || !concurrentMailbox) {
  throw new Error(
    `Could not load concurrent inbound mailbox: ${
      concurrentLookupError?.message ?? "Mailbox not found."
    }`
  );
}

return concurrentMailbox;
}