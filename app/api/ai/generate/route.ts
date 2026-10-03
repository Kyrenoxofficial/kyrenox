import "server-only";
import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { createActivityLog } from "@/app/utils/activity-log";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});



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
    const { type, prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "A prompt is required." },
        { status: 400 }
      );
    }

    let instructions =
      "You are Kyrenox AI, a professional AI assistant for freelancers. Produce clear, useful, professional output based only on the information provided. Do not invent facts.";

    if (type === "proposal") {
      instructions =
        "You are Kyrenox AI, a professional freelance proposal assistant. Write concise, professional client-ready proposals. Use only the information provided. Never invent client facts, pricing, deliverables, timelines, experience, services, or results.";
    }

    if (type === "content") {
      instructions =
        "You are Kyrenox AI, a professional content assistant for freelancers. Create clear, engaging content based only on the information provided. Do not invent facts. Follow the requested platform, format, and tone.";
    }

   if (type === "message") {
  instructions =
    "You are Kyrenox AI, a professional client communication assistant for freelancers. Write a natural, concise, client-ready reply that directly addresses the client's message and its intent. Respond in the same language as the client's message. Use relevant context from the prompt when it is provided. Do not automatically use the client's name unless it feels natural and appropriate. Do not invent or assume client details, project details, pricing, availability, deadlines, deliverables, experience, results, policies, or commitments. Never claim that something is available, agreed, completed, or approved unless the provided information explicitly supports it. When important information is missing, ask only the most relevant clarifying question instead of giving a generic response. Avoid generic filler such as 'Let me know how I can assist' when a more direct response is possible. Keep the tone professional, friendly, natural, and concise. Return only the reply text, without labels, explanations, or quotation marks.";
}

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      maxTokens: 700,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    const output =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .filter((item: any) => item?.type === "text")
              .map((item: any) => item.text)
              .join("")
          : "";

   if (type === "message") {
  await createActivityLog({
    userId: user.id,
    eventType: "ai.reply.generated",
    message: "AI reply generated.",
    metadata: {
      model: "mistral-small-latest",
    },
  });
}

return NextResponse.json({ output });

      } catch (error) {
    console.error("Mistral AI error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
  {
    error: "Kyrenox AI is temporarily busy. Please try again in a moment.",
  },
  { status: 429 }
);
    }

    return NextResponse.json(
      {
        error: "Kyrenox AI is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}