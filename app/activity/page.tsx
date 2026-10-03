"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  Bot,
  CheckCircle2,
  CircleAlert,
  Filter,
  Mail,
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { createClient } from "../utils/client";

const supabase = createClient();

type ActivityEventType =
  | "message.received"
  | "message.updated"
  | "message.deleted"
  | "message.draft_created"
  | "message.sent"
  | "message.failed"
  | "ai.reply.generated"
  | "automation.triggered";

type ActivityLog = {
  id: number;
  event_type: ActivityEventType;
  message: string;
  client_id: number | null;
  project_id: number | null;
  created_at: string;
};

type Client = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
};

type ActivityFilter = "all" | ActivityEventType;

const eventFilters: Array<{
  value: ActivityFilter;
  label: string;
}> = [
  { value: "all", label: "All activity" },
  { value: "message.received", label: "Messages received" },
  { value: "message.sent", label: "Messages sent" },
  { value: "message.deleted", label: "Messages deleted" },
  { value: "message.updated", label: "Messages updated" },
  { value: "message.draft_created", label: "Drafts created" },
  { value: "message.failed", label: "Failed messages" },
  { value: "ai.reply.generated", label: "AI replies" },
  { value: "automation.triggered", label: "Automations" },
];

function getActivityEventLabel(eventType: ActivityEventType) {
  switch (eventType) {
    case "message.received":
      return "Message received";
    case "message.updated":
      return "Message updated";
    case "message.deleted":
      return "Message deleted";
    case "message.draft_created":
      return "Draft created";
    case "message.sent":
      return "Message sent";
    case "message.failed":
      return "Message failed";
    case "ai.reply.generated":
      return "AI reply generated";
    case "automation.triggered":
      return "Automation triggered";
  }
}

function getActivityIcon(eventType: ActivityEventType) {
  switch (eventType) {
    case "message.received":
      return Mail;

    case "message.sent":
      return CheckCircle2;

    case "message.deleted":
      return Trash2;

    case "message.failed":
      return CircleAlert;

    case "ai.reply.generated":
      return Sparkles;

    case "automation.triggered":
      return Zap;

    case "message.updated":
    case "message.draft_created":
      return Bot;
  }
}

function getActivityIconClasses(eventType: ActivityEventType) {
  switch (eventType) {
    case "message.received":
      return "bg-[#EFF6FF] text-[#2563EB]";

    case "message.sent":
      return "bg-[#F0FDF4] text-[#16A34A]";

    case "message.deleted":
      return "bg-[#FEF2F2] text-[#DC2626]";

    case "message.failed":
      return "bg-[#FFF7ED] text-[#EA580C]";

    case "ai.reply.generated":
      return "bg-[#F5F3FF] text-[#7C3AED]";

    case "automation.triggered":
      return "bg-[#F3F4F6] text-[#111111]";

    case "message.updated":
    case "message.draft_created":
      return "bg-[#F3F4F6] text-[#6B7280]";
  }
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDayHeading(date: string) {
  const activityDate = new Date(date);
  const today = new Date();

  const isToday =
    activityDate.getDate() === today.getDate() &&
    activityDate.getMonth() === today.getMonth() &&
    activityDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    activityDate.getDate() === yesterday.getDate() &&
    activityDate.getMonth() === yesterday.getMonth() &&
    activityDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(activityDate);
}

export default function ActivityPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadActivity();
  }, []);


  useEffect(() => {
  let cancelled = false;
  let channel: ReturnType<typeof supabase.channel> | null = null;

  async function subscribeToActivity() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || cancelled) {
      return;
    }

    channel = supabase
      .channel(`activity-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          if (!cancelled) {
            await loadActivity();
          }
        }
      )
      .subscribe();
  }

  subscribeToActivity();

  return () => {
    cancelled = true;

    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);


  async function loadActivity(isRefresh = false) {
    setLoadError(false);

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const [
      { data: activityData, error: activityError },
      { data: clientsData, error: clientsError },
      { data: projectsData, error: projectsError },
    ] = await Promise.all([
      supabase
        .from("activity_logs")
        .select(
          "id, event_type, message, client_id, project_id, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),

      supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id),

      supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", user.id),
    ]);

   if (activityError) {
  console.error("Failed to load activity logs:", activityError);
  setLoadError(true);
}

    if (clientsError) {
      console.error("Failed to load clients:", clientsError);
    }

    if (projectsError) {
      console.error("Failed to load projects:", projectsError);
    }

    setActivityLogs(activityData || []);
    setClients(clientsData || []);
    setProjects(projectsData || []);

    setLoading(false);
    setRefreshing(false);
  }

  function getClientName(clientId: number | null) {
    if (!clientId) {
      return null;
    }

    return (
      clients.find((client) => client.id === clientId)?.name ?? null
    );
  }

  function getProjectName(projectId: number | null) {
    if (!projectId) {
      return null;
    }

    return (
      projects.find((project) => project.id === projectId)?.name ?? null
    );
  }

  const filteredActivity = useMemo(() => {
    if (filter === "all") {
      return activityLogs;
    }

    return activityLogs.filter(
      (activity) => activity.event_type === filter
    );
  }, [activityLogs, filter]);

  const groupedActivity = useMemo(() => {
    const groups: Array<{
      label: string;
      items: ActivityLog[];
    }> = [];

    for (const activity of filteredActivity) {
      const label = formatDayHeading(activity.created_at);
      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.items.push(activity);
      } else {
        groups.push({
          label,
          items: [activity],
        });
      }
    }

    return groups;
  }, [filteredActivity]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-10">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between gap-4">
          <a
            href="/dashboard"
            className="text-sm text-[#9CA3AF] transition hover:text-[#111111]"
          >
            ← Back to Dashboard
          </a>

          <button
            type="button"
            onClick={() => loadActivity(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-medium text-[#111111] shadow-sm transition hover:bg-[#FCFCFC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-[#E5E7EB]">
                <ActivityIcon className="h-4.5 w-4.5 text-[#111111]" />
              </div>

              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
                Workspace
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
              Activity
            </h1>

            <p className="mt-1.5 text-sm text-[#6B7280]">
              A complete history of activity across your Kyrenox workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
            <ActivityIcon className="h-4 w-4 text-[#9CA3AF]" />

            <span className="text-sm font-medium text-[#111111]">
              {filteredActivity.length}
            </span>

            <span className="text-sm text-[#9CA3AF]">
              {filteredActivity.length === 1 ? "event" : "events"}
            </span>
          </div>
        </div>

        <div className="mb-7 flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[#111111]">
            <Filter className="h-4 w-4 text-[#9CA3AF]" />
            Filter activity
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as ActivityFilter)
            }
            className="min-w-0 rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111111] outline-none transition focus:border-[#111111] sm:min-w-[220px]"
          >
            {eventFilters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
  <div className="space-y-3">
    {[0, 1, 2, 3].map((item) => (
      <div
        key={item}
        className="animate-pulse rounded-lg border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm"
      >
        <div className="flex gap-4">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-[#F3F4F6]" />

          <div className="min-w-0 flex-1">
            <div className="h-4 w-40 rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-3 w-64 max-w-full rounded bg-[#F3F4F6]" />
            <div className="mt-3 h-3 w-24 rounded bg-[#F3F4F6]" />
          </div>
        </div>
      </div>
    ))}
  </div>
) : loadError ? (
    
  <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-sm">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF2F2]">
      <ActivityIcon className="h-5 w-5 text-[#DC2626]" />
    </div>

    <h2 className="mt-4 text-sm font-semibold text-[#111111]">
      Activity could not be loaded
    </h2>

    <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[#9CA3AF]">
      We could not load your activity right now. Please try again.
    </p>

    <button
      type="button"
      onClick={() => loadActivity(true)}
      disabled={refreshing}
      className="mt-5 rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {refreshing ? "Retrying..." : "Try again"}
    </button>
  </div>
) : filteredActivity.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]">
              <ActivityIcon className="h-5 w-5 text-[#9CA3AF]" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#111111]">
              No activity found
            </h2>

            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[#9CA3AF]">
              {filter === "all"
                ? "Activity will appear here as you use Kyrenox."
                : "There are no activity events matching this filter."}
            </p>

            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-4 text-sm font-medium text-[#111111] underline underline-offset-4"
              >
                Show all activity
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {groupedActivity.map((group) => (
              <section key={group.label}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                    {group.label}
                  </h2>

                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
                  {group.items.map((activity, index) => {
                    const ActivityTypeIcon = getActivityIcon(
                      activity.event_type
                    );

                    const iconClasses =
                      getActivityIconClasses(activity.event_type);

                    const clientName = getClientName(
                      activity.client_id
                    );

                    const projectName = getProjectName(
                      activity.project_id
                    );

                    return (
                      <div
                        key={activity.id}
                        className={`px-5 py-4 ${
                          index !== group.items.length - 1
                            ? "border-b border-[#F1F1F1]"
                            : ""
                        }`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
                          >
                            <ActivityTypeIcon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div>
                                <p className="text-sm font-medium text-[#111111]">
                                  {getActivityEventLabel(
                                    activity.event_type
                                  )}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                                  {activity.message}
                                </p>
                              </div>

                              <span className="shrink-0 text-[11px] text-[#9CA3AF]">
                                {formatActivityDate(
                                  activity.created_at
                                )}
                              </span>
                            </div>

                            {(clientName || projectName) && (
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                                {clientName && (
                                  <span className="rounded-full bg-[#F8F9FA] px-2.5 py-1">
                                    {clientName}
                                  </span>
                                )}

                                {projectName && (
                                  <span className="rounded-full bg-[#F8F9FA] px-2.5 py-1">
                                    {projectName}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}