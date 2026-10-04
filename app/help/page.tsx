"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Guide = {
  title: string;
  description: string;
  content: string[];
};

type Category = {
  title: string;
  description: string;
  icon: LucideIcon;
  guides: Guide[];
};

const categories: Category[] = [
  {
    title: "Getting Started",
    description: "Set up your workspace and learn the Kyrenox basics.",
    icon: LayoutDashboard,
    guides: [
      {
        title: "Getting started with Kyrenox",
        description:
          "Learn how Kyrenox brings your clients, projects, proposals, content and workflows together.",
        content: [
          "Kyrenox gives you one workspace for managing the core parts of your independent work.",
          "Start by adding your clients and projects, then use the areas that fit your workflow, such as Proposals, Content, Messages, Automations and AI Workspace.",
          "You can expand your workflow over time without having to rebuild how your workspace is organized.",
        ],
      },
      {
        title: "Add your first client",
        description:
          "Create a client profile and keep important contact information in one place.",
        content: [
          "Open Clients and create a new client using their name and contact details.",
          "Once a client has been added, you can connect projects and conversations to that client.",
          "Keeping client information centralized makes it easier to work consistently across your workspace.",
        ],
      },
      {
        title: "Create your first project",
        description:
          "Organize a piece of work around a client and keep its details together.",
        content: [
          "Create a project and associate it with the relevant client.",
          "Use the project as the central reference for work that belongs to that client engagement.",
          "Projects can also be connected to other areas of Kyrenox, including proposals and messages.",
        ],
      },
    ],
  },

  {
    title: "Clients & Projects",
    description:
      "Keep client relationships and active work structured and easy to manage.",
    icon: Users,
    guides: [
      {
        title: "Manage clients",
        description:
          "Create, review, search and maintain your client records.",
        content: [
          "The Clients area gives you a central place to manage the people and businesses you work with.",
          "Use search to quickly find a client as your workspace grows.",
          "Keep contact information accurate so connected projects and conversations remain easy to identify.",
        ],
      },
      {
        title: "Manage projects",
        description:
          "Keep project information organized from start to finish.",
        content: [
          "Projects provide a dedicated place for work connected to a client.",
          "Use project details to keep important information together instead of spreading it across separate tools.",
          "Link projects to other parts of Kyrenox whenever the workflow requires additional context.",
        ],
      },
    ],
  },

  {
    title: "Proposals",
    description:
      "Create, refine and manage professional proposal drafts.",
    icon: FileText,
    guides: [
      {
        title: "Create a proposal draft",
        description:
          "Build a proposal using the client, project and scope information you already have.",
        content: [
          "Create a proposal and provide the relevant title, client, project, brief, deliverables, amount and validity details.",
          "Save the proposal as a draft while you refine the content.",
          "Review the final proposal carefully before using it externally.",
        ],
      },
      {
        title: "Use the Proposal Assistant",
        description:
          "Use AI to create a first proposal draft from your existing context.",
        content: [
          "The Proposal Assistant uses the information you provide about the client, project and proposal as context.",
          "It generates a starting point rather than a final commitment.",
          "Review and adjust the generated content before using it with a client.",
        ],
      },
    ],
  },

  {
    title: "Content",
    description:
      "Create and organize content drafts for your workflow.",
    icon: FileText,
    guides: [
      {
        title: "Create content with AI",
        description:
          "Turn an idea into a structured content draft using the Content Assistant.",
        content: [
          "Enter the title, content type, platform, tone and idea you want to work from.",
          "The Content Assistant uses that information to generate a draft.",
          "Treat the generated result as a starting point and refine it before publishing.",
        ],
      },
    ],
  },

  {
    title: "Messages",
    description:
      "Manage client conversations, drafts and AI-assisted replies.",
    icon: MessageSquare,
    guides: [
      {
        title: "Work with message drafts",
        description:
          "Create, edit and review outgoing messages before they are sent.",
        content: [
          "Message drafts are kept inside Kyrenox until you explicitly send them.",
          "You can edit a draft, associate it with a project and review it before sending.",
          "This keeps the final decision with you instead of sending unfinished communication externally.",
        ],
      },
      {
        title: "Use AI Reply",
        description:
          "Generate a professional reply using the latest client message as context.",
        content: [
          "AI Reply uses the latest incoming client message together with relevant conversation context.",
          "The generated response is placed into the draft area rather than being sent immediately.",
          "Review and edit the response before sending it to the client.",
        ],
      },
    ],
  },

  {
    title: "Automations",
    description:
      "Build focused workflows that reduce repetitive manual work.",
    icon: Zap,
    guides: [
      {
        title: "Create an automation",
        description:
          "Define when an automation should run, what conditions apply and what action it should perform.",
        content: [
          "An automation starts when its configured trigger occurs.",
          "Kyrenox then evaluates the configured conditions before running the action.",
          "Keep each automation focused on one clear workflow so it stays easy to understand, review and maintain.",
        ],
      },
      {
        title: "Understand automation modes",
        description:
          "Choose how much control you want over the result of an automation.",
        content: [
          "Draft mode keeps the result as a draft without sending it externally.",
          "Review mode lets you inspect the result before it is sent.",
          "Auto-send automatically sends the configured result without manual review.",
          "Choose the mode based on how much review and control the workflow requires.",
        ],
      },
    ],
  },

  {
    title: "AI Workspace",
    description:
      "Use Kyrenox AI tools to speed up common freelance workflows.",
    icon: Sparkles,
    guides: [
      {
        title: "Proposal Assistant",
        description:
          "Create a proposal draft using structured client and project context.",
        content: [
          "Provide the relevant proposal information and let the assistant create a first draft.",
          "Use the result as a working draft and refine it before sharing anything externally.",
        ],
      },
      {
        title: "Content Assistant",
        description:
          "Turn a content idea into a structured draft for your chosen platform.",
        content: [
          "Choose the content type, platform and tone, then describe your idea.",
          "The assistant generates a draft that you can review and refine before publishing.",
        ],
      },
      {
        title: "Prompt Library",
        description:
          "Use reusable prompts for common freelance tasks and workflows.",
        content: [
          "Browse the Prompt Library by category to find a suitable starting point.",
          "Copy prompts that match the task you are working on and adapt them to your specific situation.",
          "The library is designed to reduce repetitive prompt writing and give you reliable starting points.",
        ],
      },
      {
        title: "Knowledge Base",
        description:
          "Store reusable business context for your AI-assisted workflows.",
        content: [
          "Add knowledge items that are useful across your AI workflows.",
          "Keep important information clear, relevant and up to date so it can provide better context when AI features use it.",
          "You can manage your knowledge items directly from the Knowledge Base.",
        ],
      },
    ],
  },

  {
    title: "Analytics",
    description:
      "Get a clearer overview of activity and business performance.",
    icon: BarChart3,
    guides: [
      {
        title: "Read your analytics",
        description:
          "Use Analytics to understand the information available across your workspace.",
        content: [
          "The Analytics area gives you an overview of key information from your workspace.",
          "Use it to identify trends and understand how your work is developing over time.",
          "Analytics is intended as a workspace overview and does not replace a dedicated accounting system.",
        ],
      },
    ],
  },

  {
  title: "Settings",
  description:
    "Manage your account, security and workspace information.",
  icon: Settings,
  guides: [
    {
      title: "Change your password",
      description:
        "Update your Kyrenox account password from Settings.",
      content: [
        "Open Settings and go to the Security section.",
        "Enter your new password and confirm it before submitting the change.",
        "Kyrenox requires the password to meet the minimum requirement shown in the form.",
      ],
    },
    {
      title: "Set your sender name",
      description:
        "Choose the name Kyrenox shows to clients when you send messages.",
      content: [
        "Open Settings and go to the Communication section.",
        "Enter the name you want clients to see when you send messages through Kyrenox.",
        "Save your sender name. It will be used for outgoing client communication.",
      ],
    },
  ],
},
];

const faqItems = [
  {
    question: "Are message drafts sent automatically?",
    answer:
      "No. A saved message draft remains inside Kyrenox until you explicitly send it.",
  },
  {
    question: "Can I review an AI-generated reply before sending it?",
    answer:
      "Yes. AI Reply places the generated response into the draft area so you can review and edit it before sending.",
  },
  {
    question: "Can I edit a draft after creating it?",
    answer:
      "Yes. Supported drafts can be reviewed and edited before you use them externally.",
  },
  {
    question: "What are automations used for?",
    answer:
      "Automations help you structure repeatable workflows using supported triggers, conditions and actions.",
  },
  {
    question: "Which automation mode should I use?",
    answer:
      "Use Draft when you want the result kept as a draft, Review when you want to approve the result before sending, and Auto-send when you have explicitly configured the workflow for automatic sending.",
  },
  {
    question: "Should I trust AI output without reviewing it?",
    answer:
      "AI-generated content should be treated as a draft. Review the result and make any necessary changes before using it externally.",
  },
  {
    question: "Where can I get additional help?",
    answer:
      "Open Contact Support from the Help & Support section of the Kyrenox sidebar and describe your question or issue.",
  },
];



export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [activeGuide, setActiveGuide] = useState<{
    guide: Guide;
    category: string;
  } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return categories.flatMap((category) =>
      category.guides
        .filter(
          (guide) =>
            guide.title.toLowerCase().includes(normalizedQuery) ||
            guide.description.toLowerCase().includes(normalizedQuery) ||
            category.title.toLowerCase().includes(normalizedQuery)
        )
        .map((guide) => ({
          guide,
          category: category.title,
        }))
    );
  }, [normalizedQuery]);

  function openGuide(guide: Guide, category: string) {
    setActiveGuide({ guide, category });

    requestAnimationFrame(() => {
      document
        .getElementById("guide-preview")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9CA3AF]">
          Help Center
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          How can we help?
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6B7280] md:text-base">
          Find answers, learn how Kyrenox works, and get the most out of your
          workspace.
        </p>

        <div className="relative mx-auto mt-7 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles..."
            className="h-12 w-full rounded-lg border border-[#D1D5DB] bg-white pl-11 pr-4 text-base text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
          />
        </div>
      </section>

      {normalizedQuery ? (
        <section className="mx-auto mt-10 max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Search results
            </h3>

            <span className="text-xs text-[#9CA3AF]">
              {searchResults.length} result
              {searchResults.length === 1 ? "" : "s"}
            </span>
          </div>

          {searchResults.length > 0 ? (
            <div className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white">
              {searchResults.map(({ guide, category }) => (
                <button
                  key={`${category}-${guide.title}`}
                  type="button"
                  onClick={() => openGuide(guide, category)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left transition hover:bg-[#FAFAFA]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111111]">
                      {guide.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                      {category} · {guide.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white px-6 py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-[#D1D5DB]" />
              <p className="mt-3 text-sm font-medium">
                No articles found
              </p>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Try another search term.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  Browse
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  Explore help topics
                </h3>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <div
                    key={category.title}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#D1D5DB]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#6B7280]">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold">
                          {category.title}
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-1">
                      {category.guides.map((guide) => (
                        <button
                          key={guide.title}
                          type="button"
                          onClick={() =>
                            openGuide(guide, category.title)
                          }
                          className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-xs text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
                        >
                          <span className="min-w-0 truncate">
                            {guide.title}
                          </span>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-12">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 md:p-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                    Need a quick answer?
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Popular guides
                  </h3>
                </div>

                <BookOpen className="h-5 w-5 text-[#9CA3AF]" />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {categories
                  .flatMap((category) =>
                    category.guides.slice(0, 1).map((guide) => ({
                      guide,
                      category: category.title,
                    }))
                  )
                  .slice(0, 6)
                  .map(({ guide, category }) => (
                    <button
                      key={`${category}-${guide.title}`}
                      type="button"
                      onClick={() => openGuide(guide, category)}
                      className="rounded-lg border border-[#E5E7EB] p-4 text-left transition hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
                    >
                      <p className="text-xs text-[#9CA3AF]">
                        {category}
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {guide.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                        {guide.description}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeGuide && (
        <section
          id="guide-preview"
          className="mt-10 scroll-mt-6"
        >
          <div className="rounded-xl border border-[#E5E7EB] bg-white">
            <div className="border-b border-[#E5E7EB] px-6 py-5 md:px-7">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                {activeGuide.category}
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                {activeGuide.guide.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                {activeGuide.guide.description}
              </p>
            </div>

            <div className="px-6 py-6 md:px-7">
              <div className="space-y-4">
                {activeGuide.guide.content.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-[#374151]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#6B7280]" />
            <h3 className="text-xl font-semibold">
              Frequently asked questions
            </h3>
          </div>

          <div className="mt-5 divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <button
                  key={item.question}
                  type="button"
                  onClick={() =>
                    setOpenFaq(isOpen ? null : index)
                  }
                  className="w-full px-5 py-5 text-left"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-sm font-medium">
                      {item.question}
                    </span>

                    <span className="text-lg leading-none text-[#9CA3AF]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </div>

                  {isOpen && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B7280]">
                      {item.answer}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-12 pb-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-[#E5E7EB] bg-white px-6 py-7 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                Still need help?
              </p>

              <h3 className="mt-1 text-lg font-semibold">
                Contact Kyrenox Support
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B7280]">
                Tell us what you need help with and include as much context
                as possible.
              </p>
            </div>

            <Link
              href="/help/support"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}