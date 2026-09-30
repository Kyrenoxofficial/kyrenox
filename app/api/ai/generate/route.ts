import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

console.log("MISTRAL_API_KEY loaded:", Boolean(process.env.MISTRAL_API_KEY));

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({
      output,
    });
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