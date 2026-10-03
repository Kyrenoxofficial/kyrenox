import "server-only";

import { createAdminClient } from "@/app/utils/supabase/admin";

export type ActivityLogEventType =
  | "message.received"
  | "message.updated"
  | "message.deleted"
  | "message.draft_created"
  | "message.sent"
  | "message.failed"
  | "ai.reply.generated"
  | "automation.triggered";

export type CreateActivityLogInput = {
  userId: string;
  eventType: ActivityLogEventType;
  message: string;
  clientId?: number | null;
  projectId?: number | null;
  messageId?: number | null;
  metadata?: Record<string, unknown> | null;
};

export async function createActivityLog({
  userId,
  eventType,
  message,
  clientId = null,
  projectId = null,
  messageId = null,
  metadata = null,
}: CreateActivityLogInput): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      event_type: eventType,
      message,
      client_id: clientId,
      project_id: projectId,
      message_id: messageId,
      metadata,
    });

    if (error) {
      console.error("Failed to create activity log:", error);
    }
  } catch (error) {
    console.error("Activity log error:", error);
  }
}