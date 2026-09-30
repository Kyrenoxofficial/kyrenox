import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      "You are a professional AI assistant for freelancers. Produce clear, useful, structured output based only on the information provided.";

    if (type === "proposal") {
      instructions =
        "You are a professional freelance proposal assistant. Create clear, concise, professional proposal drafts. Do not invent client facts, pricing, deliverables, timelines, or guarantees that were not provided.";
    }

    if (type === "content") {
      instructions =
        "You are a professional content assistant for freelancers. Create clear, useful, engaging content based only on the information provided. Do not invent facts. Adapt the output to the requested platform, format, and tone.";
    }

    const response = await openai.responses.create({
      model: "gpt-5.6",
      instructions,
      input: prompt,
    });

    return NextResponse.json({
      output: response.output_text,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    return NextResponse.json(
      { error: "AI generation failed." },
      { status: 500 }
    );
  }
}