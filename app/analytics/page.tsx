"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../utils/client";

const supabase = createClient();

type Proposal = {
  id: number;
  title: string;
  status: string;
  amount: number | null;
  created_at: string;
};

type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

type ContentItem = {
  id: number;
  title: string;
  status: string;
  created_at: string;
};

type Automation = {
  id: number;
  name: string;
  status: string;
  created_at: string;
};

type MonthData = {
  label: string;
  revenue: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}K €`;
  }

  return `${Math.round(value)} €`;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [clients, setClients] = useState(0);
  const [tasks, setTasks] = useState(0);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [taskItems, setTaskItems] = useState<Task[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);

  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthData[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in to view analytics.");
      setLoading(false);
      return;
    }

    const [
      proposalResult,
      projectResult,
      clientResult,
      taskResult,
      contentResult,
      automationResult,
    ] = await Promise.all([
      supabase
        .from("proposals")
        .select("id, title, status, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active"),

      supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),

      supabase
        .from("tasks")
        .select("id, title, completed, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("content_items")
        .select("id, title, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("automations")
        .select("id, name, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const firstError =
      proposalResult.error ||
      projectResult.error ||
      clientResult.error ||
      taskResult.error ||
      contentResult.error ||
      automationResult.error;

    if (firstError) {
      console.error(firstError);
      setError("Analytics could not be loaded.");
      setLoading(false);
      return;
    }

    const nextProposals = proposalResult.data || [];
    const nextTasks = taskResult.data || [];
    const nextContent = contentResult.data || [];
    const nextAutomations = automationResult.data || [];

    setProposals(nextProposals);
    setTaskItems(nextTasks);
    setContentItems(nextContent);
    setAutomations(nextAutomations);

    const acceptedRevenue = nextProposals
      .filter((proposal) => proposal.status === "accepted")
      .reduce(
        (sum, proposal) => sum + Number(proposal.amount || 0),
        0
      );

    setRevenue(acceptedRevenue);
    setActiveProjects(projectResult.count || 0);
    setClients(clientResult.count || 0);
    setTasks(nextTasks.length);

    const currentYear = new Date().getFullYear();
    const months: MonthData[] = [];

    for (let month = 0; month < 12; month += 1) {
      const monthRevenue = nextProposals
        .filter((proposal) => {
          if (proposal.status !== "accepted") {
            return false;
          }

          const createdAt = new Date(proposal.created_at);

          return (
            createdAt.getFullYear() === currentYear &&
            createdAt.getMonth() === month
          );
        })
        .reduce(
          (sum, proposal) => sum + Number(proposal.amount || 0),
          0
        );

      const date = new Date(currentYear, month, 1);

      months.push({
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        revenue: monthRevenue,
      });
    }

    setMonthlyRevenue(months);
    setLoading(false);
  }

  const sentProposals = proposals.filter(
    (proposal) => proposal.status === "sent"
  ).length;

  const acceptedProposals = proposals.filter(
    (proposal) => proposal.status === "accepted"
  ).length;

  const draftProposals = proposals.filter(
    (proposal) => proposal.status === "draft"
  ).length;

  const declinedProposals = proposals.filter(
    (proposal) => proposal.status === "declined"
  ).length;

  const completedTasks = taskItems.filter(
    (task) => task.completed
  ).length;

  const taskCompletionRate =
    taskItems.length > 0
      ? Math.round((completedTasks / taskItems.length) * 100)
      : 0;

  const publishedContent = contentItems.filter(
    (item) => item.status === "published"
  ).length;

  const activeAutomations = automations.filter(
    (automation) => automation.status === "active"
  ).length;

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((month) => month.revenue),
    0
  );

  const chartScale = maxRevenue || 1;
  const hasRevenueData = maxRevenue > 0;

  const chartPoints = monthlyRevenue.map((month, index) => {
    const x =
      monthlyRevenue.length === 1
        ? 540
        : 40 + (index / (monthlyRevenue.length - 1)) * 1000;

    const y = 175 - (month.revenue / chartScale) * 135;

    return {
      ...month,
      x,
      y,
    };
  });

  const chartPath = chartPoints
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

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
            Analytics
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Track your business performance in one place.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6B7280]">Revenue</p>

            <p className="mt-2 text-2xl font-semibold text-[#111111]">
              {loading ? "—" : formatCurrency(revenue)}
            </p>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Accepted proposal value
            </p>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6B7280]">Active Projects</p>

            <p className="mt-2 text-2xl font-semibold text-[#111111]">
              {loading ? "—" : activeProjects}
            </p>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Currently active
            </p>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6B7280]">Clients</p>

            <p className="mt-2 text-2xl font-semibold text-[#111111]">
              {loading ? "—" : clients}
            </p>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Total clients
            </p>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6B7280]">Tasks</p>

            <p className="mt-2 text-2xl font-semibold text-[#111111]">
              {loading ? "—" : tasks}
            </p>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Total tasks
            </p>
          </div>
        </div>

        {/* MAIN ANALYTICS */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* REVENUE GROWTH */}
          <div className="min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">
                Revenue Growth
              </h2>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Accepted proposal value · This year
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <svg
                viewBox="0 0 1080 220"
                className="h-[220px] w-[1080px] max-w-none"
                role="img"
                aria-label="Revenue growth chart"
              >
                <line
                  x1="40"
                  y1="40"
                  x2="1040"
                  y2="40"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />

                <line
                  x1="40"
                  y1="107"
                  x2="1040"
                  y2="107"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />

                <line
                  x1="40"
                  y1="175"
                  x2="1040"
                  y2="175"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />

                {hasRevenueData ? (
                  <>
                    <text
                      x="0"
                      y="44"
                      className="fill-[#9CA3AF] text-[11px]"
                    >
                      {formatCompactCurrency(maxRevenue)}
                    </text>

                    <text
                      x="0"
                      y="111"
                      className="fill-[#9CA3AF] text-[11px]"
                    >
                      {formatCompactCurrency(maxRevenue / 2)}
                    </text>

                    <text
                      x="0"
                      y="179"
                      className="fill-[#9CA3AF] text-[11px]"
                    >
                      0 €
                    </text>

                    <path
                      d={chartPath}
                      fill="none"
                      stroke="#111111"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {chartPoints.map((point) => (
                      <circle
                        key={`${point.label}-${point.x}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#111111"
                      />
                    ))}
                  </>
                ) : (
                  <text
                    x="540"
                    y="104"
                    textAnchor="middle"
                    className="fill-[#9CA3AF] text-[12px]"
                  >
                    No accepted proposal revenue yet
                  </text>
                )}

                {chartPoints.map((point) => (
                  <text
                    key={`label-${point.label}-${point.x}`}
                    x={point.x}
                    y="205"
                    textAnchor="middle"
                    className="fill-[#9CA3AF] text-[11px]"
                  >
                    {point.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="min-w-0 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              Activity
            </h2>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Current workspace activity
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />

                  <span className="truncate text-sm text-[#111111]">
                    Proposal sent
                  </span>
                </div>

                <span className="text-sm font-medium text-[#6B7280]">
                  {sentProposals}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />

                  <span className="truncate text-sm text-[#111111]">
                    Content published
                  </span>
                </div>

                <span className="text-sm font-medium text-[#6B7280]">
                  {publishedContent}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#F97316]" />

                  <span className="truncate text-sm text-[#111111]">
                    Tasks completed
                  </span>
                </div>

                <span className="text-sm font-medium text-[#6B7280]">
                  {completedTasks}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />

                  <span className="truncate text-sm text-[#111111]">
                    Active automations
                  </span>
                </div>

                <span className="text-sm font-medium text-[#6B7280]">
                  {activeAutomations}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER ANALYTICS */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* PROPOSAL PIPELINE */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              Proposal Pipeline
            </h2>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Current proposal distribution
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md bg-[#F3F4F6] p-4">
                <p className="text-xs text-[#6B7280]">Draft</p>

                <p className="mt-2 text-xl font-semibold text-[#111111]">
                  {draftProposals}
                </p>
              </div>

              <div className="rounded-md bg-[#DBEAFE] p-4">
                <p className="text-xs text-[#2563EB]">Sent</p>

                <p className="mt-2 text-xl font-semibold text-[#111111]">
                  {sentProposals}
                </p>
              </div>

              <div className="rounded-md bg-[#DCFCE7] p-4">
                <p className="text-xs text-[#16A34A]">Accepted</p>

                <p className="mt-2 text-xl font-semibold text-[#111111]">
                  {acceptedProposals}
                </p>
              </div>

              <div className="rounded-md bg-[#FEE2E2] p-4">
                <p className="text-xs text-[#DC2626]">Declined</p>

                <p className="mt-2 text-xl font-semibold text-[#111111]">
                  {declinedProposals}
                </p>
              </div>
            </div>
          </div>

          {/* TASK COMPLETION */}
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              Task Completion
            </h2>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Overall task progress
            </p>

            {taskItems.length > 0 ? (
              <>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold text-[#111111]">
                      {taskCompletionRate}%
                    </p>

                    <p className="mt-1 text-sm text-[#6B7280]">
                      {completedTasks} of {taskItems.length} tasks completed
                    </p>
                  </div>

                  <p className="text-sm font-medium text-[#16A34A]">
                    {completedTasks > 0
                      ? "On track"
                      : "No completed tasks yet"}
                  </p>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-full rounded-full bg-[#16A34A] transition-all"
                    style={{ width: `${taskCompletionRate}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-md bg-[#F8F9FA] px-4 py-5">
                <p className="text-sm font-medium text-[#111111]">
                  No tasks yet
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Create your first task to start tracking completion.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}