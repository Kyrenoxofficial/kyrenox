"use client";

import Link from "next/link";

const tools = [
  {
    title: "Proposal Assistant",
    description:
      "Create structured proposal drafts from client information and your sales workflow.",
    href: "/ai-workspace/proposal-assistant",
  },
  {
    title: "Content Assistant",
    description:
      "Turn ideas, notes, and briefs into structured content for your publishing workflow.",
    href: "/ai-workspace/content-assistant",
  },
  {
    title: "Prompt Library",
    description:
      "Find and reuse your most useful prompts from one organized library.",
    href: "/ai-workspace/prompt-library",
  },
  {
    title: "Knowledge Base",
    description:
      "Store useful information, resources, and context for your AI workflows.",
    href: "/ai-workspace/knowledge-base",
  },
];

export default function AIWorkspacePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <Link
          href="/dashboard"
          className="mb-8 block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            AI Workspace
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-[#6B7280]">
            Use AI to streamline proposals, content, and your independent work
            workflows.
          </p>
        </div>

        {/* HERO */}
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#2563EB]">
            Kyrenox AI Workspace
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111]">
            Work smarter with AI built into your workflow.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Keep your AI tools, prompts, and knowledge organized in one place
            so your work stays structured, repeatable, and efficient.
          </p>
        </section>

        {/* AI TOOLS */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#111111]">
              AI Tools
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              Your AI workflow in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#111111]">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                      {tool.description}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm text-[#9CA3AF] transition group-hover:text-[#111111]">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#111111]">
            AI Workflow
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            A simple structure for using AI inside Kyrenox.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-md bg-[#F8F9FA] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                01
              </p>

              <h3 className="mt-2 text-sm font-semibold text-[#111111]">
                Capture
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Collect client information, ideas, requirements, and context.
              </p>
            </div>

            <div className="rounded-md bg-[#F8F9FA] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                02
              </p>

              <h3 className="mt-2 text-sm font-semibold text-[#111111]">
                Generate
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Use prompts and AI tools to create the output you need.
              </p>
            </div>

            <div className="rounded-md bg-[#F8F9FA] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                03
              </p>

              <h3 className="mt-2 text-sm font-semibold text-[#111111]">
                Organize
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Move the result into your projects, proposals, or content
                workflow.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}