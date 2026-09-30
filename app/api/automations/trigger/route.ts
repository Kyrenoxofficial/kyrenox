import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
type AutomationRequest = {
  event?: string;
  clientId?: number;
};

type AutomationResult = {
  automationId: number;
  success: boolean;
};

const SUPPORTED_EVENT = "client.created";
const SUPPORTED_ACTION = "create_task";




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

    const body = (await request.json()) as AutomationRequest;
    const { event, clientId } = body;

    if (event !== SUPPORTED_EVENT || !clientId) {
      return NextResponse.json(
        { error: "Invalid automation request." },
        { status: 400 }
      );
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    const { data: automations, error: automationError } = await supabase
      .from("automations")
      .select("id, action")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("trigger", SUPPORTED_EVENT);

    if (automationError) {
      console.error("Failed to load automations:", automationError);

      return NextResponse.json(
        { error: "Could not load automations." },
        { status: 500 }
      );
    }

    const results: AutomationResult[] = [];

    for (const automation of automations ?? []) {
      if (automation.action !== SUPPORTED_ACTION) {
        continue;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);

      const { error: taskError } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: `Follow up with new client: ${client.name}`,
          completed: false,
          due_date: dueDate.toISOString(),
        });

      if (taskError) {
        console.error(
          `Automation ${automation.id} failed:`,
          taskError
        );

        await supabase
          .from("automations")
          .update({
            status: "error",
          })
          .eq("id", automation.id)
          .eq("user_id", user.id);

        results.push({
          automationId: automation.id,
          success: false,
        });

        continue;
      }

      const { error: updateError } = await supabase
        .from("automations")
        .update({
          last_run_at: new Date().toISOString(),
        })
        .eq("id", automation.id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error(
          `Failed to update automation ${automation.id}:`,
          updateError
        );
      }

      results.push({
        automationId: automation.id,
        success: true,
      });
    }

    return NextResponse.json({
      success: true,
      triggered: results,
    });
  } catch (error) {
    console.error("Automation trigger error:", error);

    return NextResponse.json(
      { error: "Automation execution failed." },
      { status: 500 }
    );
  }
}