import Link from "next/link";
import {
  Activity,
  BarChart3,
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import MobileSidebar from "../MobileSidebar";
import UnreadMessageBadge from "../UnreadMessageBadge";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen overflow-hidden bg-[#F8F9FA] text-[#111111]">
      <div className="flex h-full">
        <aside className="hidden h-screen w-64 shrink-0 border-r border-[#E5E7EB] bg-white md:flex md:flex-col">
          <div className="flex h-20 items-center border-b border-[#E5E7EB] px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img
                src="/kyrenox-logo.svg"
                alt=""
                className="h-7 w-7"
              />
              <span className="text-xl font-medium tracking-tight">
                Kyrenox
              </span>
            </Link>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
            <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Workspace
            </p>

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/clients"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <Users className="h-4 w-4" />
                Clients
              </Link>

              <Link
                href="/projects"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <FolderKanban className="h-4 w-4" />
                Projects
              </Link>

              <Link
                href="/proposals"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <FileText className="h-4 w-4" />
                Proposals
              </Link>

              <Link
                href="/content"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <FileText className="h-4 w-4" />
                Content
              </Link>

              <Link
                href="/automations"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <Zap className="h-4 w-4" />
                Automations
              </Link>

              <Link
                href="/analytics"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>

              <Link
                href="/activity"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <Activity className="h-4 w-4" />
                Activity
              </Link>
            </div>

            <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Communication
            </p>

            <div className="space-y-1">
              <Link
                href="/messages"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
                <UnreadMessageBadge />
              </Link>
            </div>

            <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Tools
            </p>

            <div className="space-y-1">
              <Link
                href="/ai-workspace"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <Sparkles className="h-4 w-4" />
                AI Workspace
              </Link>
            </div>

            <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Help & Support
            </p>

            <div className="space-y-1">
              <Link
                href="/help"
                className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm font-medium text-[#111111]"
              >
                <BookOpen className="h-4 w-4" />
                Help Center
              </Link>

              <Link
                href="/help/support"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Link>
            </div>
         </nav>

<div className="shrink-0 border-t border-[#E5E7EB] bg-white p-4">
  <Link
    href="/settings"
    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
  >
    <Settings className="h-4 w-4" />
    Settings
  </Link>
</div>
</aside>

<section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
            <div className="md:hidden">
              <MobileSidebar />
            </div>

            <div>
              <p className="text-sm text-[#6B7280]">Help & Support</p>
              <h1 className="text-lg font-semibold">Help Center</h1>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}