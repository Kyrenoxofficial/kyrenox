import "server-only";

import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("MISTRAL_API_KEY is not configured.");
}

const mistral = new Mistral({
  apiKey,
});

type GenerateTextInput = {
  systemPrompt: string;
  userPrompt: string;
};

export async function generateAiText({
  systemPrompt,
  userPrompt,
}: GenerateTextInput) {
  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    maxTokens: 700,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  const output =
    typeof content === "string"
      ? content.trim()
      : Array.isArray(content)
        ? content
            .filter((item: any) => item?.type === "text")
            .map((item: any) => item.text)
            .join("")
            .trim()
        : "";

  if (!output) {
    throw new Error("The AI returned an empty response.");
  }

  return output;
}