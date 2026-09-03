"use client";
import { useState } from "react";
import {
  Sparkles,
  Users,
  FileText,
  Zap,
  ChartLine,
  FolderKanban,
  Brain,
  Lightbulb,
  Target,
  MessageCircle,
  FilePenLine,
  UserRound,
CircleCheck,
} from "lucide-react";
export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="flex h-20 items-center justify-between px-8 md:px-16">
       <div className="flex items-center gap-2">
  <img
    src="/kyrenox-logo.svg"
    alt="Kyrenox"
    className="h-7 w-7"
  />
  <span className="text-xl font-semibold tracking-tight">
    Kyrenox
  </span>
</div>

        <nav className="hidden items-center gap-10 text-sm md:flex">
          <a href="#product" className="hover:opacity-60">
            Features
          </a>
          <a href="#pricing" className="hover:opacity-60">
            Pricing
          </a>
          <a href="#product" className="hover:opacity-60">
            Resources
          </a>
          <a href="#" className="hover:opacity-60">
            Login
          </a>

          <a
            href="#pricing"
            className="rounded-md bg-black px-5 py-2.5 text-xs font-medium text-white"
          >
            Get Started
          </a>
        </nav>

        <button className="text-3xl md:hidden">
          ☰
        </button>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-start gap-16 px-8 pb-32 pt-20 md:grid-cols-2 md:px-12 md:pt-24">
        
        {/* Left side */}
        <div>
          <p className="mb-8 text-sm text-[#6B7280]">
            Kyrenox · The OS for Independent Work
          </p>

          <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Your business.
            <br />
            One system.
          </h1>

          <p className="mt-10 max-w-lg text-lg leading-7 text-[#6B7280]">
            Manage clients, projects, proposals, content, invoices
            and AI-powered workflows — all in one intelligent
            workspace.
          </p>

          <div className="mt-10 flex gap-4">
            <a
              href="#pricing"
              className="rounded-md bg-black px-6 py-4 text-sm font-medium text-white"
            >
              Get Kyrenox
            </a>

            <a
              href="#get-started"
              className="rounded-md border border-[#D9DDE3] bg-white px-6 py-4 text-sm font-medium text-black"
            >
              Book Demo
            </a>
          </div>

          <div className="mt-8 flex gap-8 text-sm text-[#6B7280]">
            <span>
              <span className="text-green-600">✓</span> Organized
            </span>
            <span>
              <span className="text-green-600">✓</span> Automated
            </span>
            <span>
              <span className="text-green-600">✓</span> Scalable
            </span>
          </div>
        </div>

        {/* Dashboard */}
        <div className="rounded-2xl border border-[#E1E4E8] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.10)]">
          <h2 className="mb-5 text-lg font-semibold">
            Dashboard
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-4">
              <p className="text-xs text-[#6B7280]">Revenue</p>
              <p className="mt-1 text-lg font-semibold">€42,580</p>
              <p className="mt-1 text-[10px] text-green-600">
                +18.4% this month
              </p>
            </div>

           <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-3 py-4">
              <p className="whitespace-nowrap text-xs text-[#6B7280]">Active Projects</p>
              <p className="mt-1 whitespace-nowrap text-lg font-semibold">18 Active</p>
              <p className="mt-1 text-[10px] text-green-600">
                +3 this week
              </p>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-4">
              <p className="text-xs text-[#6B7280]">Clients</p>
              <p className="mt-1 text-lg font-semibold">124</p>
              <p className="mt-1 text-[10px] text-green-600">
                +12 this month
              </p>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-4">
              <p className="text-xs text-[#6B7280]">Tasks</p>
              <p className="mt-1 text-lg font-semibold">42</p>
              <p className="mt-1 text-[10px] text-orange-500">
                8 due today
              </p>
            </div>
          </div>

          {/* Bottom dashboard */}
          <div className="mt-7 grid grid-cols-[1.5fr_1fr] gap-6">
            <div>
              <h3 className="text-xs font-medium">
                Revenue Growth
              </h3>

              <div className="mt-4">
  <div className="flex">
    <div className="flex h-24 w-7 flex-col justify-between text-[8px] text-[#9CA3AF]">
      <span>60K</span>
      <span>40K</span>
      <span>20K</span>
    </div>

    <div className="relative h-24 flex-1">
      <div className="absolute left-0 right-0 top-0 border-t border-[#F0F0F0]" />
      <div className="absolute left-0 right-0 top-1/2 border-t border-[#F0F0F0]" />
      <div className="absolute bottom-0 left-0 right-0 border-b border-[#E5E7EB]" />

      <svg
        viewBox="-6 0 312 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,78 50,48 100,20 150,50 200,68 250,48 300,58"
          fill="none"
          stroke="#111111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="0" cy="78" r="3" fill="#111111" />
        <circle cx="50" cy="48" r="3" fill="#111111" />
        <circle cx="100" cy="20" r="3" fill="#111111" />
        <circle cx="150" cy="50" r="3" fill="#111111" />
        <circle cx="200" cy="68" r="3" fill="#111111" />
        <circle cx="250" cy="48" r="3" fill="#111111" />
        <circle cx="300" cy="58" r="3" fill="#111111" />
      </svg>
    </div>
  </div>

  <div className="ml-7 mt-1 flex justify-between text-[8px] text-[#9CA3AF]">
    <span>Jan</span>
    <span>Feb</span>
    <span>Mar</span>
    <span>Apr</span>
    <span>May</span>
    <span>Jun</span>
    <span>Jul</span>
  </div>
</div>

              
            </div>

            <div>
              <h3 className="text-xs font-medium">
                Activity
              </h3>

              <div className="mt-4 space-y-3 text-[10px]">
                <p>
                  <span className="text-green-600">●</span>{" "}
                  Proposal sent
                </p>
                <p>
                  <span className="text-blue-500">●</span>{" "}
                  Client meeting
                </p>
                <p>
                  <span className="text-orange-500">●</span>{" "}
                  Invoice paid
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
   <section className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  {/* Features heading */}
  <div className="max-w-2xl">
    <p className="text-[10px] text-[#6B7280]">
      Features
    </p>

    <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
      Everything you need
      <br />
      to run your business.
    </h2>

    <p className="mt-5 max-w-xl text-sm leading-5 text-[#6B7280]">
      From client management and proposals to AI workflows and
      analytics — everything works together in one connected system.
    </p>
  </div>

  {/* Feature cards */}
  <div className="mt-20 grid gap-x-14 gap-y-16 md:grid-cols-3">

    {/* AI Workspace */}
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold">
        <Sparkles className="inline-block h-4 w-4 mr-1" /> AI Workspace
      </h3>

      <p className="mt-5 text-[10px] leading-3 text-[#6B7280]">
        Organize knowledge and
        <br />
        work faster with AI.
      </p>

      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-2">
        <p className="text-[11px] font-medium">Prompt Library</p>
        <p className="mt-2 text-[10px] text-[#6B7280]">Proposal Generator</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">Client Outreach</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">Content Ideas</p>
      </div>
    </div>

    {/* Client CRM */}
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold">
       <Users className="inline-block h-4 w-4 mr-1" /> Client CRM
      </h3>

      <p className="mt-5 text-[10px] leading-3 text-[#6B7280]">
        Manage your clients in
        <br />
        one organized workspace.
      </p>

      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-2">
        <p className="text-[11px] font-medium">Clients</p>
        <p className="mt-2 text-[10px] text-[#6B7280]">Sarah Wilson</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">David Lee</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">Emma Brown</p>
      </div>
    </div>

    {/* Proposal Engine */}
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold">
        <FileText className="inline-block h-4 w-4 mr-1" /> Proposal Engine
      </h3>

      <p className="mt-5 text-[10px] leading-3 text-[#6B7280]">
        Create professional proposals
        <br />
        in minutes.
      </p>

      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-2">
        <p className="text-[11px] font-medium">Proposal #24</p>
        <p className="mt-2 text-[10px] text-[#6B7280]">€2,400</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">
          <span className="text-green-600">●</span> Sent
        </p>
      </div>
    </div>

    {/* Automations */}
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold">
        <Zap className="inline-block h-4 w-4 mr-1" /> Automations
      </h3>

      <p className="mt-5 text-[10px] leading-3 text-[#6B7280]">
        Automate repetitive work
        <br />
        with connected workflows.
      </p>

      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-2">
        <p className="text-[11px] font-medium">Workflow</p>
        <p className="mt-2 text-[10px] text-[#6B7280]">Proposal sent</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">Create invoice</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">Notify client</p>
      </div>
    </div>

    {/* Analytics */}
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold">
       <ChartLine className="inline-block h-4 w-4 mr-1" /> Analytics
      </h3>

      <p className="mt-5 text-[10px] leading-3 text-[#6B7280]">
        Track revenue and performance
        <br />
        at a glance.
      </p>

      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-4">
 <svg viewBox="0 0 180 70" className="h-24 w-full -ml-2">
    {/* Y-Axis */}
    <line
      x1="8"
      y1="5"
      x2="8"
      y2="60"
      stroke="#E5E7EB"
      strokeWidth="1"
    />

    {/* X-Axis */}
    <line
      x1="8"
      y1="60"
      x2="170"
      y2="60"
      stroke="#E5E7EB"
      strokeWidth="1"
    />

    {/* Chart line */}
    <polyline
      points="8,48 45,18 80,42 115,25 140,34 160,29"
      fill="none"
      stroke="#111111"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>
    </div>

    {/* Project Hub */}
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold">
       <FolderKanban className="inline-block h-4 w-4 mr-1" /> Project Hub
      </h3>

      <p className="mt-5 text-[10px] leading-3 text-[#6B7280]">
        Organize projects, tasks and deadlines
        <br />
        in one place.
      </p>

      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-2">
        <p className="text-[11px] font-medium">Projects</p>
        <p className="mt-2 text-[10px] text-[#6B7280]">
          <span className="text-green-600">✓</span> Website
        </p>
        <p className="mt-1 text-[10px] text-[#6B7280]">
          <span className="text-green-600">✓</span> Branding
        </p>
        <p className="mt-1 text-[10px] text-[#6B7280]">
          <span className="text-[#9CA3AF]">○</span> Launch
        </p>
      </div>
    </div>

  </div>
</section>
<section id="product" className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  <div>
    <p className="text-xs font-medium text-[#6B7280]">Product</p>

    <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-[32px]">
      Everything in one connected workspace.
    </h2>

    <p className="mt-7 text-sm text-[#6B7280]">
      See how Kyrenox brings your clients, projects and workflows together.
    </p>
  </div>

  <div className="mt-28 flex justify-center">
    <div className="w-full max-w-[462px] overflow-hidden rounded-[13px] bg-[#191919] shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
      <div className="px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <svg
  width="20"
  height="20"
  viewBox="0 0 20 20"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  className="shrink-0"
>
  <path
    d="M10 2.2C6.7 2.2 4.3 4.6 4.3 7.6C4.3 9.8 5.5 11.5 7.1 12.4C6.4 13.2 6 14.3 6 15.5C6 16.8 7.1 17.8 8.4 17.8H11.6C12.9 17.8 14 16.8 14 15.5C14 14.3 13.6 13.2 12.9 12.4C14.5 11.5 15.7 9.8 15.7 7.6C15.7 4.6 13.3 2.2 10 2.2Z"
    stroke="#D8D8D8"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M7.2 7.1C7.2 6.1 8 5.4 9 5.4C9.5 5.4 9.9 5.6 10.2 6C10.5 5.6 11 5.4 11.5 5.4C12.5 5.4 13.2 6.1 13.2 7.1C13.2 7.7 12.9 8.2 12.5 8.5C12.9 8.8 13.2 9.3 13.2 9.9C13.2 10.9 12.4 11.6 11.4 11.6C10.9 11.6 10.5 11.4 10.2 11C9.9 11.4 9.5 11.6 9 11.6C8 11.6 7.2 10.9 7.2 9.9C7.2 9.3 7.5 8.8 7.9 8.5C7.5 8.2 7.2 7.7 7.2 7.1Z"
    stroke="#D8D8D8"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
          <span className="text-[23px] font-semibold text-[#E8E8E8]">
            Prompt Library
          </span>
        </div>

        <div className="mt-2 flex items-center gap-5 text-[9px] text-[#BDBDBD]">
          <span className="rounded-md bg-[#303030] px-2 py-1 text-white">
            ▦ &nbsp; All prompts
          </span>
          <span>▥ &nbsp; By Category</span>
          <span>▦ &nbsp; Ready</span>
          <span className="ml-auto">☰</span>
        </div>

        <div className="mt-2 grid grid-cols-[1fr_145px_70px] border-b border-[#303030] pb-2 text-[9px] text-[#8D8D8D]">
          <span>Prompt</span>
          <span>◉ &nbsp; Category</span>
          <span>◉ &nbsp; Quality check</span>
        </div>

        <div className="divide-y divide-[#292929] text-[9px] text-[#D0D0D0]">
          {[
            "Proposal: Project Plan + RACI in 5 Minutes",
            "Automation: Deal Won → Project Setup",
            "Lead Gen: LinkedIn Search Strings for Target",
            "Client Comms: Project Status (Red/Yellow/Green)",
            "Client Comms: Create Kickoff Agenda",
            "Client Comms: Summarize Feedback",
            "Client Comms: Review Request (Deadline)",
            "Content: How-to Framework Post",
            "Lead Gen: Discovery Call Qualifier",
            "Proposal: Deliverables + Acceptance Criteria",
            "Content: Post aus Kundenfrage",
            "Lead Gen: Trigger-Based Outreach List",
          ].map((prompt, index) => (
            <div
              key={prompt}
              className="grid h-[27px] grid-cols-[1fr_145px_70px] items-center"
            >
              <span className="truncate pr-2">
                <span className="mr-2 inline-flex text-[#35A76A]">
  {index % 3 === 0 ? (
    <Lightbulb className="h-3 w-3" strokeWidth={1.8} />
  ) : index % 3 === 1 ? (
    <Zap className="h-3 w-3" strokeWidth={1.8} />
  ) : index % 3 === 2 ? (
    <Target className="h-3 w-3" strokeWidth={1.8} />
  ) : (
    <MessageCircle className="h-3 w-3" strokeWidth={1.8} />
  )}
</span>
                {prompt}
              </span>

              <span>
                {(index === 7 || index === 10) && (
                  <span className="rounded bg-[#4A4A4A] px-2 py-1 text-[8px] text-[#D5D5D5]">
                    Content
                  </span>
                )}
              </span>

              <span>
                <span className="rounded bg-[#356B50] px-2 py-1 text-[8px] font-medium text-[#BFE5CF]">
                  Ready
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
<section className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  <div>
    <p className="text-xs font-medium text-[#6B7280]">Workflows</p>

    <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-[32px]">
      From idea to done.
    </h2>

    <p className="mt-7 text-sm text-[#6B7280]">
      Connect your clients, projects, proposals and automations in one seamless workflow.
    </p>
  </div>

  <div className="mt-20 w-full max-w-[556px] rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] px-8 py-8">
<div className="grid grid-cols-[48px_12px_48px_12px_48px_12px_60px_12px_48px] items-start justify-center">

      <div className="text-center">
        <UserRound className="mx-auto h-4 w-4 text-[#111111]" strokeWidth={1.7} />
        <p className="mt-4 text-[11px] font-medium text-[#111111]">Client</p>
        <p className="mt-3 text-[10px] text-[#9CA3AF]">New client</p>
      </div>

      <div className="flex justify-center -mt-1 text-[16px] text-[#A3AAB3]">→</div>
      <div className="text-center">
        <FileText className="mx-auto h-4 w-4 text-[#111111]" strokeWidth={1.7} />
        <p className="mt-4 text-[11px] font-medium text-[#111111]">Proposal</p>
        <p className="mt-3 text-[10px] text-[#9CA3AF]">Create offer</p>
      </div>

     <div className="flex justify-center -mt-1 text-[16px] text-[#A3AAB3]">→</div>

      <div className="text-center">
        <FolderKanban className="mx-auto h-4 w-4 text-[#111111]" strokeWidth={1.7} />
        <p className="mt-4 text-[11px] font-medium text-[#111111]">Project</p>
        <p className="mt-3 text-[10px] text-[#9CA3AF]">Manage work</p>
      </div>

      <div className="flex justify-center -mt-1 text-[16px] text-[#A3AAB3]">→</div>

      <div className="text-center">
        <Zap className="mx-auto h-4 w-4 text-[#111111]" strokeWidth={1.7} />
        <p className="mt-4 text-[11px] font-medium text-[#111111]">Automation</p>
        <p className="mt-3 text-[10px] text-[#9CA3AF]">Automate</p>
      </div>

      <div className="flex justify-center -mt-1 text-[16px] text-[#A3AAB3]">→</div>

      <div className="text-center">
        <CircleCheck
          className="mx-auto h-4 w-4 text-[#22A55A]"
          strokeWidth={1.7}
        />
        <p className="mt-4 text-[11px] font-medium text-[#111111]">Done</p>
        <p className="mt-3 text-[10px] text-[#9CA3AF]">Completed</p>
      </div>

    </div>
  </div>
</section>
<section className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  <div>
    <p className="text-xs font-medium text-[#6B7280]">
      Built for independent work.
    </p>

    <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-[32px]">
      Everything you need. Nothing you don't.
    </h2>

    <p className="mt-5 text-sm text-[#6B7280]">
      A focused system for running your business without the clutter.
    </p>
  </div>

  <div className="mt-24 w-full max-w-[435px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]">
    <div className="grid grid-cols-2">
      <div className="border-r border-[#E5E7EB] px-4 py-5">
        <p className="text-[12px] font-medium text-[#6B7280]">
          Scattered tools
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5">
          <span className="w-fit rounded bg-[#F0F1F3] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]">
            Notion
          </span>

          <span className="w-fit rounded bg-[#F0F1F3] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]">
            Docs
          </span>

          <span className="w-fit rounded bg-[#F0F1F3] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]">
            AI tools
          </span>

          <span className="w-fit rounded bg-[#F0F1F3] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]">
            Automations
          </span>
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-[12px] font-medium text-[#111111]">
          Kyrenox
        </p>

        <div className="mt-7 space-y-2 text-[10px] text-[#111111]">
          <p><span className="mr-1 text-[#22A55A]">✓</span>Clients</p>
          <p><span className="mr-1 text-[#22A55A]">✓</span>Projects</p>
          <p><span className="mr-1 text-[#22A55A]">✓</span>Proposals</p>
          <p><span className="mr-1 text-[#22A55A]">✓</span>AI Workspace</p>
          <p><span className="mr-1 text-[#22A55A]">✓</span>Automations</p>
        </div>
      </div>
    </div>
  </div>
</section>
<section id="pricing" className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  <div>
    <p className="text-xs font-medium text-[#6B7280]">Pricing</p>

    <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-[32px]">
      Simple pricing. Built to scale.
    </h2>

    <p className="mt-5 text-sm text-[#6B7280]">
      Start with everything you need to run your business.
    </p>
  </div>

  <div className="mt-24 w-full max-w-[357px] rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_35px_rgba(0,0,0,0.07)]">
    <p className="text-sm font-medium text-[#111111]">
      Kyrenox
    </p>

    <p className="mt-2 text-xs text-[#6B7280]">
      Notion workspace
    </p>

    <div className="mt-10">
      <p className="text-4xl font-semibold tracking-tight text-[#111111]">
        €79
      </p>

      <p className="mt-3 text-xs text-[#6B7280]">
        one-time purchase
      </p>
    </div>

    <p className="mt-7 text-sm font-medium text-[#111111]">
      Lifetime access to the Notion system
    </p>

    <div className="mt-7 space-y-2 text-[10px] text-[#111111]">
      <p><span className="mr-1 text-[#22A55A]">✓</span>Full Kyrenox workspace</p>
      <p><span className="mr-1 text-[#22A55A]">✓</span>Prompt Library</p>
      <p><span className="mr-1 text-[#22A55A]">✓</span>Proposal Engine</p>
      <p><span className="mr-1 text-[#22A55A]">✓</span>Workflow systems</p>
      <p><span className="mr-1 text-[#22A55A]">✓</span>Analytics</p>
      <p><span className="mr-1 text-[#22A55A]">✓</span>Regular product updates</p>
    </div>

    <a
  href="#get-started"
  className="mt-7 block w-full rounded-md bg-[#111111] py-2.5 text-center text-xs font-medium text-white transition hover:bg-[#222222]"
>
  Get Kyrenox
</a>
  </div>
</section>
<section id="faq" className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  <div>
   
    <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-[32px]">
      Questions, answered.
    </h2>

    <p className="mt-5 text-sm text-[#6B7280]">
      Everything you need to know before getting started.
    </p>
  </div>

  <div className="mt-20 max-w-[488px]">
    {[
      {
        question: "What is Kyrenox?",
        answer:
          "Kyrenox is an all-in-one workspace for freelancers to manage clients, projects, proposals, and workflows in one connected system.",
      },
      {
        question: "Who is Kyrenox for?",
        answer:
          "Kyrenox is built for freelancers and independent professionals who want one focused system to manage their work, clients, and projects.",
      },
      {
        question: "What do I get with Kyrenox?",
        answer:
          "You get an all-in-one workspace with client management, proposals, AI tools, project tracking, analytics, and automation workflows.",
      },
      {
        question: "Do I need Notion to use it?",
        answer:
          "Yes. Kyrenox is built in Notion, so you'll need a Notion account to use the workspace.",
      },
      {
        question: "How does the setup work?",
        answer:
          "After purchase, you'll get access to the Kyrenox workspace and can set it up in a few simple steps using the included setup guide.",
      },
    ].map((faq, index) => (
      <div key={faq.question} className="border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() =>
            setOpenIndex(openIndex === index ? null : index)
          }
          className="flex w-full items-center justify-between py-5 text-left"
        >
          <span className="text-sm font-medium text-[#111111]">
            {faq.question}
          </span>

          <span className="ml-6 text-lg font-light text-[#111111]">
            {openIndex === index ? "−" : "+"}
          </span>
        </button>

        {openIndex === index && (
          <div className="pb-5 pr-8">
            <p className="text-sm leading-6 text-[#6B7280]">
              {faq.answer}
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
</section>
<section id="get-started" className="mx-auto max-w-6xl px-8 py-24 md:px-12">
  <div>
    <p className="text-xs font-medium text-[#6B7280]">Get started</p>

    <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-[32px]">
      Ready to work like a system?
    </h2>

    <p className="mt-5 text-sm text-[#6B7280]">
      Bring your clients, projects and workflows into one focused workspace.
    </p>

    <a
  href="#pricing"
  className="mt-24 inline-block rounded-md bg-[#111111] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#222222]"
>
  Get Kyrenox
</a>
  </div>
</section>
<footer className="mx-auto max-w-6xl px-8 pb-24 pt-12 md:px-12">
  <div className="grid grid-cols-2 gap-12">
    <div>
      <p className="text-sm font-medium text-[#111111]">Kyrenox</p>

      <p className="mt-6 text-xs text-[#6B7280]">
        Operating System for Independent Work.
      </p>

      <div className="mt-20 max-w-[412px] border-t border-[#E5E7EB] pt-10">
        <p className="text-xs text-[#6B7280]">
          © 2026 Kyrenox. All rights reserved.
        </p>
      </div>
    </div>

    <div className="pt-1">
      <div className="space-y-7 text-xs text-[#111111]">
        <a href="#product" className="block">
          Product
        </a>

        <a href="#faq" className="block">
          FAQ
        </a>

        <a href="#pricing" className="block">
          Get Kyrenox
        </a>
      </div>
    </div>
  </div>
</footer>
</main>
);
}