"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const prompts = [
  // Proposals
  {
    title: "Proposal Introduction",
    category: "Proposals",
    prompt:
      "Write a concise, professional introduction for a freelance proposal using only the provided client and project information.",
  },
  {
    title: "Proposal Scope",
    category: "Proposals",
    prompt:
      "Turn the provided project requirements into a clear proposal scope with precise deliverables and defined boundaries.",
  },
  {
    title: "Proposal Overview",
    category: "Proposals",
    prompt:
      "Write a concise project overview for a freelance proposal that clearly explains the requested work and intended scope.",
  },
  {
    title: "Proposal Deliverables",
    category: "Proposals",
    prompt:
      "Transform the provided project requirements into a polished list of freelance proposal deliverables without adding unrequested services.",
  },
  {
    title: "Proposal Closing",
    category: "Proposals",
    prompt:
      "Write a concise, professional closing for a freelance proposal with a clear and natural next step.",
  },
  {
    title: "Proposal Revision",
    category: "Proposals",
    prompt:
      "Rewrite this freelance proposal to make it clearer, more confident, and more professional while preserving the original meaning and commitments.",
  },
  {
    title: "Proposal Personalization",
    category: "Proposals",
    prompt:
      "Personalize this freelance proposal using only the provided client and project details without inventing background information.",
  },
  {
    title: "Proposal Value Statement",
    category: "Proposals",
    prompt:
      "Write a concise value statement based only on the provided project scope, client needs, and intended outcome.",
  },
  {
    title: "Proposal Simplifier",
    category: "Proposals",
    prompt:
      "Simplify this freelance proposal so it is easier to scan while preserving all important information and commitments.",
  },
  {
    title: "Proposal Follow-up",
    category: "Proposals",
    prompt:
      "Write a concise professional follow-up message for a client after sending a freelance proposal.",
  },

  // Sales
  {
    title: "Lead Qualification",
    category: "Sales",
    prompt:
      "Create a practical lead qualification checklist covering project fit, scope, budget, timeline, and decision-making.",
  },
  {
    title: "Discovery Questions",
    category: "Sales",
    prompt:
      "Generate focused client discovery questions that uncover goals, scope, constraints, budget, timeline, and expectations.",
  },
  {
    title: "Discovery Call Agenda",
    category: "Sales",
    prompt:
      "Create a structured agenda for a freelance discovery call covering goals, scope, budget, timeline, and next steps.",
  },
  {
    title: "Cold Outreach",
    category: "Sales",
    prompt:
      "Write a concise cold outreach message for a freelancer using only the provided audience, offer, and context.",
  },
  {
    title: "Warm Outreach",
    category: "Sales",
    prompt:
      "Write a natural and professional warm outreach message based only on the provided relationship and context.",
  },
  {
    title: "Lead Re-engagement",
    category: "Sales",
    prompt:
      "Write a concise re-engagement message for a lead who stopped responding after an initial conversation.",
  },
  {
    title: "Sales Objection Response",
    category: "Sales",
    prompt:
      "Write a professional response to the provided client objection without inventing facts, guarantees, or concessions.",
  },
  {
    title: "Sales Call Recap",
    category: "Sales",
    prompt:
      "Turn these sales call notes into a concise recap with decisions, open questions, concerns, and next steps.",
  },
  {
    title: "Offer Positioning",
    category: "Sales",
    prompt:
      "Turn the provided freelance offer into a clear positioning statement focused on the target client's needs.",
  },
  {
    title: "Call-to-Action Ideas",
    category: "Sales",
    prompt:
      "Generate five concise calls to action suitable for the provided freelance offer and target audience.",
  },

  // Content
  {
    title: "Social Hook Generator",
    category: "Content",
    prompt:
      "Generate five strong opening hooks for the provided topic. Keep them concise, specific, and attention-grabbing.",
  },
  {
    title: "Educational Post",
    category: "Content",
    prompt:
      "Turn the provided idea into an educational social post with a strong opening, useful insights, and a simple call to action.",
  },
  {
    title: "Short-form Video Script",
    category: "Content",
    prompt:
      "Turn the provided idea into a concise short-form video script with a strong hook, clear body, and natural closing.",
  },
  {
    title: "Thread Generator",
    category: "Content",
    prompt:
      "Turn the provided topic into a structured social media thread with a strong opening and logical progression.",
  },
  {
    title: "LinkedIn Post",
    category: "Content",
    prompt:
      "Turn the provided idea into a professional LinkedIn post that is clear, useful, natural, and easy to scan.",
  },
  {
    title: "Newsletter Draft",
    category: "Content",
    prompt:
      "Turn the provided topic into a concise newsletter with a strong subject line, useful body, and clear call to action.",
  },
  {
    title: "Content Repurposing",
    category: "Content",
    prompt:
      "Repurpose the provided idea into a social post, thread, short-video concept, and newsletter angle without inventing facts.",
  },
  {
    title: "Content Rewrite",
    category: "Content",
    prompt:
      "Rewrite this content to make it clearer, more engaging, and easier to read while preserving the original meaning.",
  },
  {
    title: "Hook Variations",
    category: "Content",
    prompt:
      "Create ten alternative hooks for the provided content idea using different angles such as curiosity, problem, insight, and direct value.",
  },
  {
    title: "Content Ideas",
    category: "Content",
    prompt:
      "Generate ten distinct and practical content ideas around the provided topic, audience, and offer.",
  },

  // Communication
  {
    title: "Client Email",
    category: "Communication",
    prompt:
      "Rewrite this client email to sound clear, confident, professional, and human without making it overly formal.",
  },
  {
    title: "Project Update",
    category: "Communication",
    prompt:
      "Write a concise client project update covering completed work, current status, open items, and next steps.",
  },
  {
    title: "Delay Notification",
    category: "Communication",
    prompt:
      "Write a professional message explaining a project delay using only the provided reason and updated information.",
  },
  {
    title: "Scope Change Message",
    category: "Communication",
    prompt:
      "Write a professional message explaining how the provided new request changes the original project scope.",
  },
  {
    title: "Feedback Request",
    category: "Communication",
    prompt:
      "Write a concise message asking the client for focused feedback on the provided work.",
  },
  {
    title: "Meeting Confirmation",
    category: "Communication",
    prompt:
      "Write a concise professional meeting confirmation using the provided date, time, purpose, and details.",
  },
  {
    title: "Payment Reminder",
    category: "Communication",
    prompt:
      "Write a polite and professional payment reminder using only the provided invoice and payment details.",
  },
  {
    title: "Project Completion Email",
    category: "Communication",
    prompt:
      "Write a professional project completion email summarizing the completed work and the provided next steps.",
  },
  {
    title: "Difficult Client Response",
    category: "Communication",
    prompt:
      "Rewrite this response to a difficult client so it remains calm, clear, professional, and solution-focused.",
  },
  {
    title: "Professional Rewrite",
    category: "Communication",
    prompt:
      "Rewrite this message to sound polished, confident, and professional while preserving the original meaning.",
  },

  // Operations
  {
    title: "Project Summary",
    category: "Operations",
    prompt:
      "Summarize the provided project information into status, completed work, open tasks, risks, and next steps.",
  },
  {
    title: "Project Kickoff Notes",
    category: "Operations",
    prompt:
      "Turn project kickoff notes into a structured summary covering objectives, scope, responsibilities, and next steps.",
  },
  {
    title: "Task Breakdown",
    category: "Operations",
    prompt:
      "Break the provided project goal or deliverable into practical tasks that can be added to a freelance workflow.",
  },
  {
    title: "Project Checklist",
    category: "Operations",
    prompt:
      "Create a practical project checklist from the provided scope, deliverables, and milestones.",
  },
  {
    title: "Risk Review",
    category: "Operations",
    prompt:
      "Identify practical project risks from the provided information and suggest one mitigation step for each.",
  },
  {
    title: "Weekly Review",
    category: "Operations",
    prompt:
      "Turn the provided weekly notes into a concise review covering progress, blockers, completed work, and next priorities.",
  },
  {
    title: "Client Handoff",
    category: "Operations",
    prompt:
      "Create a structured client handoff checklist using the provided project information and deliverables.",
  },
  {
    title: "Project Retrospective",
    category: "Operations",
    prompt:
      "Create a concise project retrospective covering what worked, what could improve, and lessons from the provided notes.",
  },
  {
    title: "Task Prioritization",
    category: "Operations",
    prompt:
      "Prioritize the provided tasks using urgency, dependencies, importance, and project impact.",
  },
  {
    title: "End-of-Day Review",
    category: "Operations",
    prompt:
      "Turn these daily work notes into a concise review of completed work, open items, blockers, and tomorrow's priorities.",
  },

  // Automation
  {
    title: "Workflow Analysis",
    category: "Automation",
    prompt:
      "Analyze the provided workflow and identify repetitive manual steps that could realistically be automated.",
  },
  {
    title: "Automation Opportunity Finder",
    category: "Automation",
    prompt:
      "Identify the highest-value automation opportunities in the provided workflow and explain why they may be useful.",
  },
  {
    title: "Automation Trigger",
    category: "Automation",
    prompt:
      "Identify the most suitable automation trigger for the provided workflow based only on the described process.",
  },
  {
    title: "Automation Action Map",
    category: "Automation",
    prompt:
      "Turn the provided process into a clear sequence of automation actions from trigger to final outcome.",
  },
  {
    title: "Workflow Map",
    category: "Automation",
    prompt:
      "Convert the provided manual process into a simple trigger-to-action workflow that can be implemented in an automation platform.",
  },
  {
    title: "Make Workflow",
    category: "Automation",
    prompt:
      "Design a practical Make workflow for the provided process, including trigger, actions, and expected outcome.",
  },
  {
    title: "n8n Workflow",
    category: "Automation",
    prompt:
      "Design a practical n8n workflow for the provided process with a clear trigger, actions, and expected result.",
  },
  {
    title: "Zapier Workflow",
    category: "Automation",
    prompt:
      "Design a practical Zapier workflow for the provided process with a clear trigger, actions, and expected result.",
  },
  {
    title: "Automation Audit",
    category: "Automation",
    prompt:
      "Review the provided workflow and identify inefficient manual steps, duplicate work, and realistic automation opportunities.",
  },
  {
    title: "Automation Documentation",
    category: "Automation",
    prompt:
      "Turn the provided automation into clear documentation covering its trigger, actions, conditions, and expected outcome.",
  },

  // Productivity
  {
    title: "Daily Priority Plan",
    category: "Productivity",
    prompt:
      "Turn the provided task list into a focused daily plan ordered by priority and urgency.",
  },
  {
    title: "Weekly Planning",
    category: "Productivity",
    prompt:
      "Turn the provided goals and tasks into a realistic weekly plan with clear priorities.",
  },
  {
    title: "Time Blocking Plan",
    category: "Productivity",
    prompt:
      "Turn the provided tasks and available hours into a practical time-blocking plan.",
  },
  {
    title: "Focus Session",
    category: "Productivity",
    prompt:
      "Create a focused work session plan for completing the provided task with clear steps and minimal distractions.",
  },
  {
    title: "Workload Review",
    category: "Productivity",
    prompt:
      "Review the provided workload and identify priorities, potential overload, and tasks that could be deferred.",
  },
  {
    title: "Goal Breakdown",
    category: "Productivity",
    prompt:
      "Break the provided freelance goal into smaller actionable milestones and tasks.",
  },
  {
    title: "Focus Improvement",
    category: "Productivity",
    prompt:
      "Review the provided workflow or work habits and suggest practical ways to create a more focused freelance process.",
  },
  {
    title: "Simple SOP",
    category: "Productivity",
    prompt:
      "Turn the provided recurring process into a clear step-by-step standard operating procedure.",
  },
  {
    title: "Weekly Reflection",
    category: "Productivity",
    prompt:
      "Turn the provided weekly notes into a reflection covering progress, lessons, unfinished work, and next priorities.",
  },
  {
    title: "Priority Matrix",
    category: "Productivity",
    prompt:
      "Organize the provided tasks into a practical priority matrix based on urgency and importance.",
  },

  // Freelancing
  {
    title: "Freelance Offer",
    category: "Freelancing",
    prompt:
      "Turn the provided skills and service information into a concise freelance offer statement without inventing credentials.",
  },
  {
    title: "Service Description",
    category: "Freelancing",
    prompt:
      "Write a clear professional description of the provided freelance service using only the supplied information.",
  },
  {
    title: "Ideal Client Profile",
    category: "Freelancing",
    prompt:
      "Create a practical ideal client profile based only on the provided target audience information.",
  },
  {
    title: "Freelance Bio",
    category: "Freelancing",
    prompt:
      "Write a concise professional freelance bio using only the provided experience, skills, and positioning.",
  },
  {
    title: "Portfolio Description",
    category: "Freelancing",
    prompt:
      "Write a concise portfolio project description based only on the provided project facts and outcomes.",
  },
  {
    title: "Case Study Structure",
    category: "Freelancing",
    prompt:
      "Turn the provided project information into a structured case study covering context, challenge, approach, work, and outcome.",
  },
  {
    title: "Client Onboarding",
    category: "Freelancing",
    prompt:
      "Create a practical client onboarding checklist for the provided freelance service and project.",
  },
  {
    title: "Freelance Process",
    category: "Freelancing",
    prompt:
      "Turn the provided working method into a clear client-facing freelance process with concise steps.",
  },
  {
    title: "Service Package",
    category: "Freelancing",
    prompt:
      "Structure the provided freelance services into a clear package without inventing pricing or additional services.",
  },
  {
    title: "Freelance FAQ",
    category: "Freelancing",
    prompt:
      "Create a concise FAQ for the provided freelance service using only the information supplied.",
  },
];


export default function PromptLibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  const categories = Array.from(
    new Set(prompts.map((prompt) => prompt.category))
  );

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(search.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || prompt.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  async function copyPrompt(title: string, prompt: string) {
    await navigator.clipboard.writeText(prompt);
    setCopied(title);

    setTimeout(() => {
      setCopied(null);
    }, 1500);
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
            Prompt Library
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Find, reuse, and copy prompts for your daily workflow.
          </p>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts..."
              className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
            >
              <option value="all">All categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filteredPrompts.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                    {item.category}
                  </p>

                  <h2 className="mt-1 text-base font-semibold text-[#111111]">
                    {item.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                    {item.prompt}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyPrompt(item.title, item.prompt)}
                  className="shrink-0 rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
                >
                  {copied === item.title ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}

          {filteredPrompts.length === 0 && (
            <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-[#6B7280]">
                No prompts match your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}