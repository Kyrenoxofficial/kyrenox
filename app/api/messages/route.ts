import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { createActivityLog } from "@/app/utils/activity-log";

type MessageDirection = "incoming" | "outgoing";
type MessageStatus = "received" | "draft" | "sent" | "failed";

type CreateMessageBody = {
  clientId?: number;
  projectId?: number | null;
  direction?: MessageDirection;
  content?: string;
  status?: MessageStatus;
};

type UpdateMessageBody = {
  id?: number;
  content?: string;
};

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");

    let query = supabase
      .from("messages")
      .select(
        `
          id,
client_id,
project_id,
direction,
content,
status,
created_at,
read_at,
          clients (
            id,
            name,
            email
          ),
          projects (
            id,
            name
          )
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", Number(clientId));
    }

    if (projectId) {
      query = query.eq("project_id", Number(projectId));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load messages:", error);

      return NextResponse.json(
        { error: "Could not load messages." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: data ?? [],
    });
  } catch (error) {
    console.error("Messages GET error:", error);

    return NextResponse.json(
      { error: "Could not load messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateMessageBody;

    const {
      clientId,
      projectId = null,
      direction = "incoming",
      content,
      status = "received",
    } = body;

    if (!clientId || !content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Client and message content are required." },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    if (!["incoming", "outgoing"].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid message direction." },
        { status: 400 }
      );
    }

    if (!["received", "draft", "sent", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid message status." },
        { status: 400 }
      );
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    if (projectId !== null) {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: "Project not found." },
          { status: 404 }
        );
      }
    }

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        client_id: clientId,
        project_id: projectId,
        direction,
        content: trimmedContent,
        status,
      })
      .select(
        `
          id,
          client_id,
          project_id,
          direction,
          content,
          status,
          created_at,
          clients (
            id,
            name,
            email
          ),
          projects (
            id,
            name
          )
        `
      )
      .single();

   if (messageError) {
  console.error("Failed to create message:", messageError);

  return NextResponse.json(
    { error: "Could not create message." },
    { status: 500 }
  );
}

if (status === "draft") {
  await createActivityLog({
    userId: user.id,
    eventType: "message.draft_created",
    message: "Message draft created.",
    clientId,
    projectId,
    messageId: message.id,
  });
}

return NextResponse.json(
  {
    message,
  },
  { status: 201 }
);
  } catch (error) {
    console.error("Messages POST error:", error);

    return NextResponse.json(
      { error: "Could not create message." },
      { status: 500 }
    );
  }
}




export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateMessageBody;
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "A valid message id is required." },
        { status: 400 }
      );
    }

    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const { data: existingMessage, error: existingMessageError } =
      await supabase
        .from("messages")
        .select("id, status")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (existingMessageError || !existingMessage) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 }
      );
    }

    if (existingMessage.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft messages can be edited." },
        { status: 409 }
      );
    }

    const { data: message, error } = await supabase
      .from("messages")
      .update({
        content,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "draft")
      .select(
        `
          id,
          client_id,
          project_id,
          direction,
          content,
          status,
          created_at,
          clients (
            id,
            name,
            email
          ),
          projects (
            id,
            name
          )
        `
      )
      .single();

    if (error) {
      console.error("Failed to update message:", error);

      return NextResponse.json(
        { error: "Could not update message." },
        { status: 500 }
      );
    }

    await createActivityLog({
  userId: user.id,
  eventType: "message.updated",
  message: "Message updated.",
  clientId: message.client_id,
  projectId: message.project_id,
  messageId: message.id,
});

return NextResponse.json({
  message,
});

  } catch (error) {
    console.error("Messages PATCH error:", error);

    return NextResponse.json(
      { error: "Could not update message." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "A valid message id is required." },
        { status: 400 }
      );
    }

    const { data: existingMessage, error: existingMessageError } =
      await supabase
        .from("messages")
       .select("id, status, client_id, project_id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (existingMessageError || !existingMessage) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 }
      );
    }

    if (existingMessage.status === "sent") {
      return NextResponse.json(
        { error: "Sent messages cannot be deleted." },
        { status: 409 }
      );
    }

    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .in("status", ["draft", "received", "failed"]);

    if (deleteError) {
      console.error("Failed to delete message:", deleteError);

      return NextResponse.json(
        { error: "Could not delete message." },
        { status: 500 }
      );
    }


await createActivityLog({
  userId: user.id,
  eventType: "message.deleted",
  message: "Message deleted.",
  clientId: existingMessage.client_id,
  projectId: existingMessage.project_id,
  messageId: existingMessage.id,
});


    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Messages DELETE error:", error);

    return NextResponse.json(
      { error: "Could not delete message." },
      { status: 500 }
    );
  }
}