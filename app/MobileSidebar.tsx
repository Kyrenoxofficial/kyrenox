"use client";

import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "./utils/client";

export default function MobileSidebar() {
    const supabase = createClient();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 hover:bg-[#F5F5F5] md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
          />

          <aside className="relative h-full w-72 border-r border-[#E5E7EB] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
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
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-[#F5F5F5]"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="px-4 py-6">
              <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                Workspace
              </p>

              <div className="space-y-1">
                <a
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm font-medium"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>

                <a
                  href="/clients"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
                >
                  <Users className="h-4 w-4" />
                  Clients
                </a>

                <a
                  href="/projects"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
                >
                  <FolderKanban className="h-4 w-4" />
                  Projects
                </a>

                <a
                  href="/proposals"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
                >
                  <FileText className="h-4 w-4" />
                  Proposals
                </a>

                <a
                  href="/analytics"
                  onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <Sparkles className="h-4 w-4" />
                AI Workspace
              </a>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white p-4">
              <a
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
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
    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
  >
    Log out
  </button>
</form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}