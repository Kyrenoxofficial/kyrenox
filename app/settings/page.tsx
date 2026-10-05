"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import MobileSidebar from "../MobileSidebar";
import UnreadMessageBadge from "../UnreadMessageBadge";
import { createClient } from "../utils/client";

export default function SettingsPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
const [senderName, setSenderName] = useState("");
const [loading, setLoading] = useState(true);

const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savingSenderName, setSavingSenderName] = useState(false);
const [senderNameSuccess, setSenderNameSuccess] = useState("");
const [senderNameError, setSenderNameError] = useState("");

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

const { data: profile } = await supabase
  .from("profiles")
  .select("sender_name")
  .eq("user_id", user.id)
  .single();

setSenderName(profile?.sender_name ?? "");

setLoading(false);
    }

    loadSettings();
  }, []);


  async function updateSenderName() {
  setSenderNameSuccess("");
  setSenderNameError("");

  setSavingSenderName(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      sender_name: senderName.trim() || null,
    })
    .eq("user_id", user.id);

  if (error) {
    setSenderNameError(error.message);
    setSavingSenderName(false);
    return;
  }

  setSenderNameSuccess("Sender name updated successfully.");
  setSavingSenderName(false);
}


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
  <main className="h-[100dvh] overflow-hidden bg-[#F8F9FA] text-[#111111]">
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

        </nav>

       <div className="shrink-0 border-t border-[#E5E7EB] bg-white p-4">
  <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
    Help & Support
  </p>

  <div className="space-y-1">
    <Link
      href="/help"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
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

  <div className="mt-3 border-t border-[#E5E7EB] pt-3">
    <Link
      href="/settings"
      className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm font-medium text-[#111111]"
    >
      <SettingsIcon className="h-4 w-4" />
      Settings
    </Link>

    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
    >
      Log out
    </button>
  </div>
</div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
          <div className="md:hidden">
            <MobileSidebar />
          </div>

          <div>
            <p className="text-sm text-[#6B7280]">Account</p>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-8 md:px-9 md:py-8">
            <Link
              href="/dashboard"
              className="mb-8 inline-flex items-center text-sm text-[#9CA3AF] transition hover:text-[#111111]"
            >
              ← Back to Dashboard
            </Link>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
                Settings
              </h2>

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
      Communication
    </h2>

    <p className="mt-1 text-sm text-[#6B7280]">
      Control how your name appears when you communicate with clients through Kyrenox.
    </p>
  </div>

  <div className="mt-5 max-w-xl space-y-4">
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#111111]">
        Sender name
      </label>

      <input
        type="text"
        value={loading ? "" : senderName}
        onChange={(e) => setSenderName(e.target.value)}
        placeholder="e.g. Anna Müller"
        className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
      />

      <p className="mt-2 text-xs leading-5 text-[#6B7280]">
        This name is shown to clients when you send messages through Kyrenox.
      </p>
    </div>

    {senderNameError && (
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
        {senderNameError}
      </div>
    )}

    {senderNameSuccess && (
      <div className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]">
        {senderNameSuccess}
      </div>
    )}

    <button
      type="button"
      onClick={updateSenderName}
      disabled={savingSenderName || loading}
      className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {savingSenderName ? "Saving..." : "Save Sender Name"}
    </button>
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
                        onClick={() =>
                          setShowNewPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#111111]"
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
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
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition hover:text-[#111111]"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
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
                    content, automations, analytics, and AI workflows together
                    in one workspace.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
);
}