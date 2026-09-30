let generatorPromise: Promise<any> | null = null;

export async function getLocalAI() {
  if (typeof window === "undefined") {
    throw new Error("Local AI can only run in the browser.");
  }

  if (!generatorPromise) {
    generatorPromise = import("@huggingface/transformers").then(
      async ({ pipeline }) => {
        return pipeline(
          "text-generation",
          "onnx-community/SmolLM2-135M-Instruct-ONNX",
          {
            device: "wasm",
            dtype: "q4",
          }
        );
      }
    );
  }

  return generatorPromise;
}

export async function generateLocalAI(prompt: string) {
  const generator = await getLocalAI();

  const messages = [
    {
      role: "system",
      content:
        "You are Kyrenox AI. Write professional freelance text using only the facts provided. Never invent facts. Return only the final answer.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await generator(messages, {
    max_new_tokens: 200,
    do_sample: false,
  });

  const generated = result?.[0]?.generated_text;

  if (Array.isArray(generated)) {
    return generated.at(-1)?.content ?? "";
  }

  return generated ?? "";
}