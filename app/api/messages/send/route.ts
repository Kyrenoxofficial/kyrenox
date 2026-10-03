import "server-only";

import { NextResponse } from "next/server";

import { createClient } from "@/app/utils/supabase/server";
import { sendDraftMessage } from "@/app/utils/send-draft-message";

export const runtime = "nodejs";

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

    const message = await sendDraftMessage({
      userId: user.id,
      messageId,
      source: "manual_review",
    });

    return NextResponse.json({
      message,
    });
  } catch (error) {
    console.error(
      "Failed to send message:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "The message could not be sent.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}