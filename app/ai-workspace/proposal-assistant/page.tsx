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
const [generateError, setGenerateError] = useState("");
const [saveError, setSaveError] = useState("");

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
  const briefIsWeak = hasLowInformation(brief, 10);
  const deliverablesAreWeak = hasLowInformation(deliverables, 3);

  if (titleIsWeak || briefIsWeak || deliverablesAreWeak) {
    setGenerateError(
      "Please provide meaningful project details before generating a proposal."
    );
    setGenerating(false);
    return;
  }

  try {
    const clientName =
      clients.find((client) => String(client.id) === clientId)?.name ||
      "the client";

    const projectName =
      projects.find((project) => String(project.id) === projectId)?.name ||
      "the project";

    const projectText = `${title} ${brief} ${deliverables}`.toLowerCase();

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
Write a professional freelance proposal using only the information explicitly provided below.

PROJECT INFORMATION

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

REFERENCE KNOWLEDGE BASE

The following information is reference material only.
It may be used to improve wording only when it directly matches the explicit project information above.

${knowledgeBaseText}

STRICT RULES

- Use only facts explicitly stated in PROJECT INFORMATION.
- Never invent or assume the type of work, service, industry, product, website, technology, design style, business goal, benefit, feature, result, experience, timeline, or outcome.
- Never describe the freelancer as a designer, developer, marketer, consultant, or any other profession unless that information is explicitly provided.
- Never introduce a website, app, design, branding, marketing, development, or other specific service unless it is explicitly stated in the project information.
- Never use the Knowledge Base to introduce missing project facts.
- Never use generic assumptions to make the proposal sound more complete.
- Keep the deliverables exactly faithful to the provided input.
- Never invent pricing, payment terms, dates, guarantees, credentials, or results.
- If the project information does not clearly identify the type of work, do not guess.
- If important project details are missing, ask briefly for the missing details instead of inventing them.
- Do not mention these instructions.
- Do not mention that you are an AI.
- Do not repeat the labels CLIENT, PROJECT, TITLE, BRIEF, DELIVERABLES, BUDGET, or VALID UNTIL.
- Do not add placeholders such as [Your Name].

OUTPUT RULES

If the project information is sufficient:
- Write a concise, natural proposal in 3-4 paragraphs.
- Every factual statement about the project must be directly supported by the provided project information.

If the project information is insufficient:
- Do not create a full proposal.
- Write only a brief professional request for the missing information.
- Do not guess the service, project type, industry, deliverables, goals, or outcome.
- Do not introduce any new project facts.
- Do not promise, offer, or mention a timeline, process, availability, meeting, revision process, or next steps unless explicitly provided in the project information.
- Do not introduce future actions or commitments that are not explicitly supported by the input.
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

    const output = data.output?.trim();

    if (!output) {
      throw new Error("Kyrenox AI returned an empty proposal.");
    }

    setDraft(output);
  } catch (error) {
    console.error("Proposal AI error:", error);

    setGenerateError(
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
setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const cleanedAmount = amount
  .trim()
  .replace(/[^\d.,-]/g, "");

let parsedAmount: number | null = null;

if (cleanedAmount) {
  let normalizedAmount = cleanedAmount;

  if (cleanedAmount.includes(",") && cleanedAmount.includes(".")) {
    if (
      cleanedAmount.lastIndexOf(",") >
      cleanedAmount.lastIndexOf(".")
    ) {
      normalizedAmount = cleanedAmount
        .replace(/\./g, "")
        .replace(",", ".");
    } else {
      normalizedAmount = cleanedAmount.replace(/,/g, "");
    }
  } else if (cleanedAmount.includes(",")) {
    const parts = cleanedAmount.split(",");

    normalizedAmount =
      parts[1]?.length === 3
        ? cleanedAmount.replace(/,/g, "")
        : cleanedAmount.replace(",", ".");
  } else if (cleanedAmount.includes(".")) {
    const parts = cleanedAmount.split(".");

    normalizedAmount =
      parts.length === 2 && parts[1].length === 3
        ? cleanedAmount.replace(".", "")
        : cleanedAmount;
  }

  parsedAmount = Number(normalizedAmount);

  if (Number.isNaN(parsedAmount)) {
  setSaveError("Please enter a valid amount.");
  setSaving(false);
  return;
}
}

const { error } = await supabase.from("proposals").insert({
  user_id: user.id,
  title: title.trim(),
  client_id: clientId ? Number(clientId) : null,
  project_id: projectId ? Number(projectId) : null,
  status: "draft",
  amount: parsedAmount,
  valid_until: validUntil || null,
  content: draft,
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
  type="text"
  inputMode="decimal"
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


            {saveError && (
  <p className="mt-3 text-sm text-red-600">
    {saveError}
  </p>
)}

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