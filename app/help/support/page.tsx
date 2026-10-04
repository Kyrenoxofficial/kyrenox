"use client";

import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const supportEmail = "hello@kyrenox.co";

export default function SupportPage() {
  const [category, setCategory] = useState("General question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function openEmail() {
    const body = [
      `Category: ${category}`,
      "",
      message.trim(),
    ].join("\n");

    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(
      `[Kyrenox Support] ${subject.trim()}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  const canSend = subject.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="w-full px-4 py-8 md:px-8 md:py-10">
  <Link
    href="/help"
    className="inline-flex items-center gap-2 text-sm text-[#6B7280] transition hover:text-[#111111]"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to Help Center
  </Link>

  <div className="mx-auto mt-8 w-full max-w-4xl">
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">

        <section className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] px-6 py-5 md:px-7">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              Contact Support
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              How can we help?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Describe the issue or question and include the relevant details.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6 md:px-7">
            <div>
              <label className="text-xs font-medium text-[#6B7280]">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-base text-[#111111] outline-none focus:border-[#111111] sm:text-sm"
              >
                <option>General question</option>
                <option>Technical issue</option>
                <option>Messages</option>
                <option>Automations</option>
                <option>AI Workspace</option>
                <option>Account & Security</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280]">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="What do you need help with?"
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-base text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B7280]">
                Message
              </label>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe the problem or question..."
                rows={7}
                className="mt-2 w-full resize-none rounded-md border border-[#D1D5DB] bg-white px-3 py-3 text-base leading-6 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
              />
            </div>

            <button
              type="button"
              onClick={openEmail}
              disabled={!canSend}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Open Support Email
            </button>

            <p className="text-center text-xs leading-5 text-[#9CA3AF]">
              This opens your email application with the support request
              prepared.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#6B7280]">
              <MessageSquare className="h-4 w-4" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
              Before contacting support
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Check the Help Center first. You may find the answer immediately.
            </p>

            <Link
              href="/help"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#111111]"
            >
              Browse guides
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#6B7280]">
              <Mail className="h-4 w-4" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
              Support email
            </h3>

            <a
              href={`mailto:${supportEmail}`}
              className="mt-2 block break-all text-sm text-[#6B7280] hover:text-[#111111]"
            >
              {supportEmail}
            </a>
          </div>
        </aside>
       </div>
  </div>
</div>
  );
}