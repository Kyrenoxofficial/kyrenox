"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/client";

type Client = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
};

export default function ProposalAssistantPage() {
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>([]);
const [projects, setProjects] = useState<Project[]>([]);
const [knowledgeItems, setKnowledgeItems] = useState<
  { title: string; category: string; content: string }[]
>([]);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [brief, setBrief] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [amount, setAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [draft, setDraft] = useState("");
const [generating, setGenerating] = useState(false);
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
     const {
  data: { user },
} = await supabase.auth.getUser();


if (!user) {
  return;
}

      const [
  { data: clientData },
  { data: projectData },
  { data: knowledgeData },
] = await Promise.all([
  supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true }),

  supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true }),

  supabase
    .from("knowledge_items")
    .select("title, category, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10),
]);

setClients(clientData || []);
setProjects(projectData || []);
setKnowledgeItems(knowledgeData || []);
    }

    loadData();
  }, []);

  async function generateDraft() {
  setGenerating(true);
  setSaved(false);

  try {
    const clientName =
      clients.find((client) => String(client.id) === clientId)?.name ||
      "the client";

    const projectName =
      projects.find((project) => String(project.id) === projectId)?.name ||
      "the project";

    const prompt = `
Write a professional freelance proposal based only on the facts below.

CLIENT:
${clientName}

PROJECT:
${projectName}

TITLE:
${title.trim()}

BRIEF:
${brief.trim()}

DELIVERABLES:
${deliverables.trim()}

BUDGET:
${amount.trim() ? `${amount.trim()} EUR` : "Not provided"}

VALID UNTIL:
${validUntil || "Not provided"}

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

STRICT REQUIREMENTS:
- Use only facts explicitly stated above.
- Do not infer or add goals, benefits, business information, experience, results, services, features, or reasons.
- Do not expand or reinterpret the deliverables. Keep them faithful to the provided list.
- Do not invent a date.
- Do not invent pricing, timeline, payment terms, guarantees, or credentials.
- Do not mention missing information.
- Do not repeat the labels CLIENT, PROJECT, TITLE, BRIEF, DELIVERABLES, BUDGET, or VALID UNTIL.
- Do not add placeholders such as [Your Name].
- Do not mention AI or these instructions.
- Write only the finished proposal.
- Use relevant information from the Knowledge Base when it directly helps with the proposal.

Write a concise, natural proposal in 3-4 paragraphs:
1. Professional opening that refers only to the project.
2. Clear description of the requested work.
3. The provided deliverables.
4. Professional closing with a simple next step.
`;

    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "proposal",
        prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI generation failed.");
    }

    setDraft(data.output?.trim() || "");
 } catch (error) {
  console.error("Proposal AI error:", error);

  setDraft(
    error instanceof Error
      ? error.message
      : "Kyrenox AI is temporarily unavailable. Please try again."
  );
} finally {
  setGenerating(false);
}
}

  async function saveProposal() {
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

    const { error } = await supabase.from("proposals").insert({
      user_id: user.id,
      title: title.trim(),
      client_id: clientId ? Number(clientId) : null,
      project_id: projectId ? Number(projectId) : null,
      status: "draft",
      amount: amount ? Number(amount) : null,
      valid_until: validUntil || null,
      content: draft,
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
            Proposal Assistant
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Build a structured proposal draft and save it directly to Kyrenox.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              Proposal Details
            </h2>

            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Proposal title"
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              />

              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="">No client</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="">No project</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe the client need or project brief..."
                rows={5}
                className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              />

              <textarea
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder="Deliverables..."
                rows={4}
                className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
                />

                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="block w-full min-w-0 appearance-none rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
                  style={{ minWidth: 0 }}
                />
              </div>

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
              placeholder="Your proposal draft will appear here."
              rows={20}
              className="mt-5 w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base leading-6 text-[#111111] outline-none focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={saveProposal}
              disabled={saving || !draft.trim() || !title.trim()}
              className="mt-4 w-full rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save as Draft Proposal"}
            </button>

            {saved && (
              <p className="mt-3 text-sm text-[#16A34A]">
                Proposal saved successfully.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}