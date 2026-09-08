"use client";

import Image from "next/image";
import { createClient } from "../utils/client";

export default function ResetPasswordPage() {
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
            Set a new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Choose a new password for your Kyrenox account.
          </p>

          <form
  className="mt-10"
  onSubmit={async (e) => {
    e.preventDefault();
    const password = (e.currentTarget.password as HTMLInputElement).value;
const confirmPassword = (
  e.currentTarget["confirm-password"] as HTMLInputElement
).value;
if (password !== confirmPassword) {
  alert("Passwords do not match.");
  return;
}
const { error } = await supabase.auth.updateUser({
  password,
});

if (error) {
  alert(error.message);
  return;
}
window.location.href = "/login";
  }}
>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#111111]"
            >
              New password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your new password"
              className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
            />

            <label
              htmlFor="confirm-password"
              className="mt-6 block text-sm font-medium text-[#111111]"
            >
              Confirm password
            </label>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm your new password"
              className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
            />

            <button
              type="submit"
              className="mt-7 h-11 w-full rounded-lg bg-[#111111] text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Update password
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