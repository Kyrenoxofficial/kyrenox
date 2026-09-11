"use client";

import { useState } from "react";
import { FileText, FolderKanban, ListTodo, Plus, Users, X } from "lucide-react";

export default function NewMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
      >
        <Plus className="h-4 w-4" />
        New
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg">
          <a
            href="/clients"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F8F9FA]"
          >
            <Users className="h-4 w-4" />
            New Client
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F8F9FA]"
          >
            <FolderKanban className="h-4 w-4" />
            New Project
          </a>

          <a
            href="/proposals"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F8F9FA]"
          >
            <FileText className="h-4 w-4" />
            New Proposal
          </a>

          <a
            href="/tasks"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[#F8F9FA]"
          >
            <ListTodo className="h-4 w-4" />
            New Task
          </a>
        </div>
      )}
    </div>
  );
}