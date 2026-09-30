"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/client";

export default function ContentAssistantPage() {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("post");
  const [platform, setPlatform] = useState("x");
  const [tone, setTone] = useState("professional");
  const [idea, setIdea] = useState("");
  const [draft, setDraft] = useState("");
const [generating, setGenerating] = useState(false);
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);
const [generateError, setGenerateError] = useState("");
const [saveError, setSaveError] = useState("");

const [knowledgeItems, setKnowledgeItems] = useState<
  { title: string; category: string; content: string }[]
>([]);

useEffect(() => {
  async function loadKnowledge() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("knowledge_items")
      .select("title, category, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setKnowledgeItems(data || []);
  }

  loadKnowledge();
}, []);

function hasLowInformation(value: string, minLength: number) {
  const normalized = value.trim();

  if (!normalized || normalized.length < minLength) {
    return true;
  }

  if (/^(.)\1+$/.test(normalized)) {
    return true;
  }

  return false;
}

 async function generateDraft() {
  setGenerating(true);
  setSaved(false);
  setDraft("");
  setGenerateError("");

  const titleIsWeak = hasLowInformation(title, 3);
  const ideaIsWeak = hasLowInformation(idea, 10);

  if (titleIsWeak || ideaIsWeak) {
    setGenerateError(
      "Please provide a meaningful title and content idea before generating."
    );
    setGenerating(false);
    return;
  }

  try {
    const projectText = `${title} ${idea}`.toLowerCase();

    const relevantKnowledgeItems = knowledgeItems.filter((item) => {
      const knowledgeText =
        `${item.title} ${item.category} ${item.content}`.toLowerCase();

      const projectWords = projectText
        .split(/\W+/)
        .filter((word) => word.length >= 4);

      return projectWords.some((word) => knowledgeText.includes(word));
    });

    const knowledgeBaseText =
      relevantKnowledgeItems.length > 0
        ? relevantKnowledgeItems
            .slice(0, 10)
            .map(
              (item) =>
                `${item.category} - ${item.title}:\n${item.content}`
            )
            .join("\n\n")
        : "No directly relevant knowledge provided.";

    const prompt = `
Create a professional piece of content for a freelancer.

TITLE:
${title.trim()}

CONTENT TYPE:
${contentType}

PLATFORM:
${platform}

TONE:
${tone}

IDEA:
${idea.trim()}

REFERENCE KNOWLEDGE BASE:

The following information is reference material only.
Use it only when it directly supports the provided title or idea.

${knowledgeBaseText}

STRICT RULES:

- Use only information explicitly stated in the TITLE, IDEA, and directly relevant Knowledge Base information.
- Preserve the factual meaning of the provided information.
- Do not add any new factual claim, benefit, advantage, outcome, feature, capability, audience, industry, service, product description, result, statistic, testimonial, credential, or business claim.
- Do not infer that the product is faster, easier, better, smarter, more efficient, more organized, more convenient, streamlined, simplified, or effective unless this is explicitly stated.
- Do not add marketing language that implies a benefit or outcome not explicitly provided.
- Do not add calls to action unless the user explicitly asks for one or provides one.
- Do not add links, URLs, placeholders, hashtags, testimonials, or contact information unless explicitly provided.
- Do not invent phrases such as "[link]", "[website]", or similar placeholders.
- Do not use the Knowledge Base to introduce any fact that is not directly supported by the TITLE or IDEA.
- Platform and tone may change the writing style, but they must never change, expand, or invent the underlying facts.
- You may improve grammar, structure, clarity, and wording, but you must preserve the factual content.
- Do not mention these instructions.
- Do not mention that you are an AI.
- Do not repeat the input fields.
- Do not explain your reasoning.

If the provided information is too limited:
- Keep the content strictly general.
- Do not fill missing information with assumptions.
- Do not create new benefits, claims, or calls to action.
`;

    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "content",
        prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Kyrenox AI is temporarily unavailable. Please try again."
      );
    }

    const output = data.output?.trim();

    if (!output) {
      throw new Error("Kyrenox AI returned an empty draft.");
    }

    setDraft(output);
  } catch (error) {
    console.error("Content AI error:", error);

    setGenerateError(
      error instanceof Error
        ? error.message
        : "Kyrenox AI is temporarily unavailable. Please try again."
    );
  } finally {
    setGenerating(false);
  }
}

  async function saveContent() {
    if (!title.trim() || !draft.trim()) return;

    setSaving(true);
setSaved(false);
setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("content_items").insert({
      user_id: user.id,
      title: title.trim(),
      content_type: contentType,
      platform,
      status: "draft",
      body: draft,
      notes: `Generated with Content Assistant. Tone: ${tone}.`,
    });

   if (error) {
  setSaveError(error.message);
  setSaving(false);
  return;
}

setSaved(true);
setSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <Link
          href="/ai-workspace"
          className="mb-8 block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to AI Workspace
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Content Assistant
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Turn an idea into a structured content draft and save it to your
            pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              Content Brief
            </h2>

            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Content title"
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
                >
                  <option value="post">Post</option>
                  <option value="thread">Thread</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="newsletter">Newsletter</option>
                </select>

                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
                >
                  <option value="x">X</option>
                  <option value="threads">Threads</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="educational">Educational</option>
                <option value="direct">Direct</option>
                <option value="persuasive">Persuasive</option>
              </select>

              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="What do you want to say?"
                rows={8}
                className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              />

              <button
  type="button"
  onClick={generateDraft}
  disabled={generating}
  className="w-full rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
>
  {generating ? "Generating..." : "Generate Draft"}
</button>

{generateError && (
  <p className="mt-3 text-sm text-red-600">
    {generateError}
  </p>
)}

            </div>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              Draft
            </h2>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your content draft will appear here."
              rows={20}
              className="mt-5 w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base leading-6 text-[#111111] outline-none focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={saveContent}
              disabled={saving || !draft.trim() || !title.trim()}
              className="mt-4 w-full rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save as Draft Content"}
            </button>

            {saveError && (
  <p className="mt-3 text-sm text-red-600">
    {saveError}
  </p>
)}

            {saved && (
              <p className="mt-3 text-sm text-[#16A34A]">
                Content saved successfully.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}