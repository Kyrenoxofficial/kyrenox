"use client";

import Image from "next/image";
import { createClient } from "../utils/client";

const supabase = createClient();

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col items-center justify-center">
        <div className="mb-14">
          <div className="flex items-center justify-center gap-2">
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
            Create your account
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Start using your Kyrenox workspace.
          </p>

          <form
  className="mt-10"
  onSubmit={async (e) => {
    e.preventDefault();
    const email = (e.currentTarget.email as HTMLInputElement).value;
const password = (e.currentTarget.password as HTMLInputElement).value;
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: "https://kyrenox.co/login",
  },
});
if (error) {
  alert(error.message);
  return;
}
window.location.href = "/login";
  }}
>
            <div>
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
            </div>

            <div className="mt-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#111111]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
              />
            </div>

            <button
              type="submit"
              className="mt-7 h-11 w-full rounded-lg bg-[#111111] text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-[#111111] hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}