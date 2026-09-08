import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#E5E7EB] bg-white md:flex md:flex-col">
          <div className="flex h-20 items-center border-b border-[#E5E7EB] px-6">
            <div className="flex items-center gap-2">
              <img
                src="/kyrenox-logo.svg"
                alt=""
                className="h-7 w-7"
              />
              <span className="text-xl font-medium tracking-tight">
                Kyrenox
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Workspace
            </p>

            <div className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>

              <a
                href="/clients"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <Users className="h-4 w-4" />
                Clients
              </a>

              <a
                href="/projects"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <FolderKanban className="h-4 w-4" />
                Projects
              </a>

              <a
                href="/proposals"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <FileText className="h-4 w-4" />
                Proposals
              </a>

              <a
                href="/analytics"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </a>
            </div>

            <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Tools
            </p>

            <a
              href="/ai"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
            >
              <Sparkles className="h-4 w-4" />
              AI Workspace
            </a>
          </nav>

          <div className="border-t border-[#E5E7EB] p-4">
            <a
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
            <div>
              <p className="text-sm text-[#6B7280]">Workspace</p>
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>

            <button className="rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]">
              + New
            </button>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome back.
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Plan. Create. Automate. Grow.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Revenue</p>
                <p className="mt-2 text-2xl font-semibold">€42,580</p>
                <p className="mt-1 text-xs text-green-600">+18.4% this month</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Active Projects</p>
                <p className="mt-2 text-2xl font-semibold">18</p>
                <p className="mt-1 text-xs text-green-600">+3 this week</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Clients</p>
                <p className="mt-2 text-2xl font-semibold">124</p>
                <p className="mt-1 text-xs text-green-600">+12 this month</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Saved AI Prompts</p>
                <p className="mt-2 text-2xl font-semibold">42</p>
                <p className="mt-1 text-xs text-[#6B7280]">Workspace library</p>
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Today</h3>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Your current priorities
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    "Send proposal to client",
                    "Create content for next week",
                    "Review project timeline",
                    "Explore new AI tools",
                  ].map((task) => (
                    <label
                      key={task}
                      className="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#D1D5DB]"
                      />
                      <span>{task}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h3 className="text-sm font-semibold">Quick Actions</h3>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Start something new
                </p>

                <div className="mt-5 space-y-2">
                  <button className="flex w-full items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-left text-sm hover:bg-[#F8F9FA]">
                    <FolderKanban className="h-4 w-4" />
                    New Project
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-left text-sm hover:bg-[#F8F9FA]">
                    <FileText className="h-4 w-4" />
                    New Proposal
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-left text-sm hover:bg-[#F8F9FA]">
                    <Sparkles className="h-4 w-4" />
                    Open AI Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}