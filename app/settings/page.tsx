"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "../utils/client";

export default function SettingsPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    }

    loadSettings();
  }, []);

  async function updatePassword() {
    setSuccessMessage("");
    setErrorMessage("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "Your new password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMessage(error.message);
      setSavingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setSuccessMessage("Password updated successfully.");
    setSavingPassword(false);
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <Link
          href="/dashboard"
          className="mb-8 block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Settings
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your account and security settings.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">
                Account
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Your current account information.
              </p>
            </div>

            <div className="mt-5 max-w-xl">
              <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                Email
              </label>

              <input
                type="email"
                value={loading ? "" : email}
                readOnly
                placeholder={loading ? "Loading..." : ""}
                className="w-full rounded-md border border-[#D1D5DB] bg-[#F8F9FA] px-3 py-2.5 text-base text-[#6B7280] outline-none"
              />
            </div>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">
                Security
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Keep your Kyrenox account secure by updating your password.
              </p>
            </div>

            <div className="mt-5 max-w-xl space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  New password
                </label>

                <div className="relative">
  <input
    type={showNewPassword ? "text" : "password"}
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    placeholder="Enter a new password"
    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 pr-11 text-base text-[#111111] outline-none focus:border-[#111111]"
  />

  <button
    type="button"
    onClick={() => setShowNewPassword((value) => !value)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#111111]"
    aria-label={showNewPassword ? "Hide password" : "Show password"}
  >
    {showNewPassword ? (
      <EyeOff className="h-4 w-4" />
    ) : (
      <Eye className="h-4 w-4" />
    )}
  </button>
</div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Confirm new password
                </label>

                <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Confirm your new password"
    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 pr-11 text-base text-[#111111] outline-none focus:border-[#111111]"
  />

  <button
    type="button"
    onClick={() => setShowConfirmPassword((value) => !value)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#111111]"
    aria-label={
      showConfirmPassword ? "Hide password" : "Show password"
    }
  >
    {showConfirmPassword ? (
      <EyeOff className="h-4 w-4" />
    ) : (
      <Eye className="h-4 w-4" />
    )}
  </button>
</div>
              </div>

              {errorMessage && (
                <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]">
                  {successMessage}
                </div>
              )}

              <button
                type="button"
                onClick={updatePassword}
                disabled={savingPassword}
                className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">
                Workspace
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Kyrenox brings your clients, projects, tasks, proposals,
                content, automations, analytics, and AI workflows together in
                one workspace.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}