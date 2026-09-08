"use client";

import Image from "next/image";
import { createClient } from "../utils/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col items-center justify-center">
        <div className="mb-14">
          <div className="flex items-center gap-2">
            <Image
              src="/kyrenox-logo.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="text-xl font-medium tracking-tight text-[#111111]">
              Kyrenox
            </span>
          </div>
        </div>

        <div className="w-full max-w-[420px] rounded-2xl border border-[#E5E7EB] bg-white px-10 py-10 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form
  className="mt-10"
  onSubmit={async (e) => {
    e.preventDefault();
    const email = (e.currentTarget.email as HTMLInputElement).value;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "https://kyrenox.co/reset-password",
});
  }}
>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#111111]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
            />

            <button
              type="submit"
              className="mt-6 h-11 w-full rounded-lg bg-[#111111] text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Send reset link
            </button>
          </form>

          <div className="mt-5 text-center">
            <a
              href="/login"
              className="text-sm font-medium text-[#111111] hover:underline"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}