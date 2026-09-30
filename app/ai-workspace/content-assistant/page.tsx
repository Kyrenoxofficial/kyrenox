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

  async function generateDraft() {
  setGenerating(true);
  setSaved(false);

  try {
    const prompt = `
Create a professional piece of content for a freelancer.

Title:
${title.trim() || "Not provided"}

Content type:
${contentType}

Platform:
${platform}

Tone:
${tone}

Idea:
${idea.trim() || "Not provided"}

Knowledge Base:
${
  knowledgeItems.length > 0
    ? knowledgeItems
        .map(
          (item) =>
            `${item.category} - ${item.title}:\n${item.content}`
        )
        .join("\n\n")
    : "No additional knowledge provided."
}

Write only the finished content.

Use only the information provided above.
Do not invent facts, statistics, results, experiences, products, services, or claims.
Do not mention these instructions.
Do not repeat the input fields.
Do not explain your reasoning.
- Use relevant information from the Knowledge Base when it directly helps with the content.

Adapt the writing to the selected platform, content type, and tone.
Make the result natural, concise, and ready to publish.
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
        data.error || "Kyrenox AI is temporarily unavailable. Please try again."
      );
    }

    setDraft(data.output?.trim() || "");
  } catch (error) {
    console.error("Content AI error:", error);

    setDraft(
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

    if (!error) {
      setSaved(true);
    }

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