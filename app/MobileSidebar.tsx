"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "./utils/client";

const navigationItemClasses =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition";

export default function MobileSidebar() {
  const supabase = createClient();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }


  useEffect(() => {
  let cancelled = false;
  let channel: ReturnType<typeof supabase.channel> | null = null;

  async function initializeUnreadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || cancelled) {
      return;
    }

    const userId = user.id;

    async function loadUnreadCount() {
      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("direction", "incoming")
        .eq("status", "received")
        .is("read_at", null);

      if (error) {
        console.error("Failed to load unread message count:", error);
        return;
      }

      if (!cancelled) {
        setUnreadMessageCount(count ?? 0);
      }
    }

    await loadUnreadCount();

    if (cancelled) {
      return;
    }

    channel = supabase
      .channel(`sidebar-messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();
  }

  initializeUnreadMessages();

  return () => {
    cancelled = true;

    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);


  function getItemClasses(href: string) {
    return isActive(href)
      ? `${navigationItemClasses} bg-[#F5F5F5] font-medium text-[#111111]`
      : `${navigationItemClasses} text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111111]`;
  }

  function closeSidebar() {
    setOpen(false);
  }


useEffect(() => {
  if (!open) return;

  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
  };
}, [open]);


  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 transition hover:bg-[#F5F5F5]"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overscroll-contain md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/20"
            onClick={closeSidebar}
          />

          <aside className="relative flex h-full w-72 flex-col border-r border-[#E5E7EB] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <div className="flex h-20 items-center justify-between border-b border-[#E5E7EB] px-6">
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

              <button
                type="button"
                onClick={closeSidebar}
                className="rounded-lg p-2 transition hover:bg-[#F5F5F5]"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-80">
              <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                Workspace
              </p>

              <div className="space-y-1">
                <a
                  href="/dashboard"
                  onClick={closeSidebar}
                  className={getItemClasses("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>

                <a
                  href="/clients"
                  onClick={closeSidebar}
                  className={getItemClasses("/clients")}
                >
                  <Users className="h-4 w-4" />
                  Clients
                </a>

                <a
                  href="/projects"
                  onClick={closeSidebar}
                  className={getItemClasses("/projects")}
                >
                  <FolderKanban className="h-4 w-4" />
                  Projects
                </a>

                <a
                  href="/proposals"
                  onClick={closeSidebar}
                  className={getItemClasses("/proposals")}
                >
                  <FileText className="h-4 w-4" />
                  Proposals
                </a>

                <a
                  href="/content"
                  onClick={closeSidebar}
                  className={getItemClasses("/content")}
                >
                  <FileText className="h-4 w-4" />
                  Content
                </a>

                <a
                  href="/automations"
                  onClick={closeSidebar}
                  className={getItemClasses("/automations")}
                >
                  <Zap className="h-4 w-4" />
                  Automations
                </a>

                <a
                  href="/analytics"
                  onClick={closeSidebar}
                  className={getItemClasses("/analytics")}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </a>

                <a
                  href="/activity"
                  onClick={closeSidebar}
                  className={getItemClasses("/activity")}
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </a>
              </div>

              <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                Communication
              </p>

              <div className="space-y-1">
                <a
  href="/messages"
  onClick={closeSidebar}
  className={`${getItemClasses("/messages")} justify-between`}
>
  <span className="flex items-center gap-3">
    <MessageSquare className="h-4 w-4" />
    Messages
  </span>

  {unreadMessageCount > 0 && (
    <span className="min-w-5 rounded-full bg-[#2563EB] px-1.5 py-0.5 text-center text-[10px] font-medium text-white">
      {unreadMessageCount}
    </span>
  )}
</a>
              </div>

              <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                Tools
              </p>

              <div className="space-y-1">
                <a
                  href="/ai-workspace"
                  onClick={closeSidebar}
                  className={getItemClasses("/ai-workspace")}
                >
                  <Sparkles className="h-4 w-4" />
                  AI Workspace
                </a>
              </div>


            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white p-4">
  <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
    Help & Support
  </p>

  <div className="space-y-1">
    <a
      href="/help"
      onClick={closeSidebar}
      className={getItemClasses("/help")}
    >
      <BookOpen className="h-4 w-4" />
      Help Center
    </a>

    <a
      href="/help/support"
      onClick={closeSidebar}
      className={getItemClasses("/help/support")}
    >
      <MessageSquare className="h-4 w-4" />
      Contact Support
    </a>
  </div>

  <div className="mt-3 border-t border-[#E5E7EB] pt-3">
    <a
      href="/settings"
      onClick={closeSidebar}
      className={getItemClasses("/settings")}
    >
      <Settings className="h-4 w-4" />
      Settings
    </a>

    <form
      action={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="mt-2"
    >
      <button
        type="submit"
        className={`${navigationItemClasses} w-full text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#111111]`}
      >
        Log out
      </button>
    </form>
  </div>
</div>
          </aside>
        </div>
      )}
    </>
  );
}