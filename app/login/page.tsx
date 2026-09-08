"use client";
import Image from "next/image";
import { createClient } from "../utils/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
 const supabase = createClient();
    return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col items-center justify-center">
        {/* Kyrenox logo */}
        <div className="mb-14">
          <div className="flex items-center gap-2">
  <img
    src="/kyrenox-logo.svg"
    alt=""
    className="h-7 w-7"
  />
  <span className="text-xl font-medium tracking-tight text-[#111111]">
    Kyrenox
  </span>
</div>
        </div>

        {/* Login card */}
        <div className="w-full max-w-[420px] rounded-2xl border border-[#E5E7EB] bg-white px-10 py-10 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-[#6B7280]">
              Log in to your Kyrenox workspace.
            </p>
          </div>

          {/* Form */}
          <form
  className="mt-10"
  onSubmit={async (e) => {
    e.preventDefault();

    const email = (e.currentTarget.email as HTMLInputElement).value;
const password = (e.currentTarget.password as HTMLInputElement).value;
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
console.log("Login result:", { error });
if (error) {
  alert(error.message);
  return;
}
router.push("/dashboard");
  }}
>
            {/* Email */}
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

            {/* Password */}
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
                placeholder="Enter your password"
                className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
              />

              <div className="mt-2 flex justify-end">
                <a
                 href="/forgot-password"
                  className="text-xs text-[#6B7280] transition hover:text-[#111111]"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="mt-6 h-11 w-full rounded-lg bg-[#111111] text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Log in
            </button>
          </form>

          {/* Create account */}
          <div className="mt-5 text-center text-sm text-[#6B7280]">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-[#111111] hover:underline"
            >
              Create one
            </a>
          </div>

          {/* Divider */}
          <div className="my-7 h-px w-full bg-[#E5E7EB]" />

          {/* Google */}
          <button
            type="button"
onClick={async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://kyrenox.co/dashboard",
    },
  });
}}
            className="relative flex h-11 w-full items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#111111] transition hover:bg-[#F8F9FA]"
          >
            <span className="absolute left-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.2045C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0018 12.9232 12.0477 13.5614V15.8182H14.9564C16.6582 14.2509 17.64 11.9455 17.64 9.2045Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8182L12.0477 13.5614C11.2418 14.1014 10.2164 14.4205 9 14.4205C6.65591 14.4205 4.66955 12.8373 3.96364 10.71H0.957273V13.0418C2.43818 15.9832 5.48 18 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.96364 10.71C3.78364 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78364 7.83 3.96364 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96364 10.71Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4391 4.92318L15.0182 2.34409C13.4636 0.891818 11.4264 0 9 0C5.48 0 2.43818 2.01682 0.957273 4.95818L3.96364 7.29C4.66955 5.16273 6.65591 3.57955 9 3.57955Z"
                  fill="#EA4335"
                />
              </svg>
            </span>

            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}