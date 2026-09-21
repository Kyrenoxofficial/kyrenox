"use client";


import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../utils/client";


type Client = {
  id: number;
  name: string;
  email: string | null;
};

type Project = {
  id: number;
  name: string;
  status: string;
  description: string | null;
  created_at: string;
};

type ContentItem = {
  id: number;
  title: string;
  content_type: string;
  platform: string;
  status: string;
  publish_at: string | null;
};

type Automation = {
  id: number;
  name: string;
  tool: string;
  status: string;
  trigger: string | null;
  action: string | null;
};

export default function ClientDetailPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTaskCounts, setProjectTaskCounts] = useState<
  Record<number, { total: number; completed: number }>
>({});
  const [editing, setEditing] = useState(false);
const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    async function loadClientDetails() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const clientId = Number(window.location.pathname.split("/").pop());

      if (!clientId) {
        setLoading(false);
        return;
      }

     const [
  { data: clientData, error: clientError },
  { data: projectData, error: projectError },
  { data: contentData, error: contentError },
  { data: automationData, error: automationError },
] = await Promise.all([
  supabase
    .from("clients")
    .select("id, name, email")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single(),

  supabase
    .from("projects")
    .select("id, name, status, description, created_at")
    .eq("client_id", clientId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }),

  supabase
    .from("content_items")
    .select("id, title, content_type, platform, status, publish_at")
    .eq("client_id", clientId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }),

  supabase
    .from("automations")
    .select("id, name, tool, status, trigger, action")
    .eq("client_id", clientId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }),
]);

if (clientError) {
  console.error(clientError);
  setLoading(false);
  return;
}

if (projectError) {
  console.error(projectError);
}

if (contentError) {
  console.error(contentError);
}

if (automationError) {
  console.error(automationError);
}

setClient(clientData);
setProjects(projectData ?? []);
setContentItems(contentData ?? []);
setAutomations(automationData ?? []);

if (contentError) {
  console.error(contentError);
}

const projectIds = (projectData ?? []).map((project) => project.id);

if (projectIds.length > 0) {
  const { data: taskData, error: tasksError } = await supabase
    .from("tasks")
    .select("project_id, completed")
    .eq("user_id", user.id)
    .in("project_id", projectIds);

  if (tasksError) {
    console.error(tasksError);
  } else {
    const counts: Record<
      number,
      { total: number; completed: number }
    > = {};

    projectIds.forEach((projectId) => {
      counts[projectId] = {
        total: 0,
        completed: 0,
      };
    });

    taskData?.forEach((task) => {
      if (task.project_id !== null && counts[task.project_id]) {
        counts[task.project_id].total += 1;

        if (task.completed) {
          counts[task.project_id].completed += 1;
        }
      }
    });

    setProjectTaskCounts(counts);
  }
} else {
  setProjectTaskCounts({});
}

setLoading(false);
    }

    loadClientDetails();
  }, []);

async function saveClientChanges() {
  if (!client) {
    return;
  }

  if (!editName.trim()) {
    return;
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("clients")
    .update({
      name: editName.trim(),
      email: editEmail.trim() || null,
    })
    .eq("id", client.id);

  if (error) {
    alert(error.message);
    return;
  }

  setClient({
    ...client,
    name: editName.trim(),
    email: editEmail.trim() || null,
  });

  setEditing(false);
}

  function getStatusLabel(status: string) {
    if (status === "completed") {
      return "Completed";
    }

    if (status === "on_hold") {
      return "On Hold";
    }

    return "Active";
  }

  function getStatusClasses(status: string) {
    if (status === "completed") {
      return "bg-[#DCFCE7] text-[#16A34A]";
    }

    if (status === "on_hold") {
      return "bg-[#FEF3C7] text-[#D97706]";
    }

    return "bg-[#DBEAFE] text-[#2563EB]";
  }

function getContentStatusLabel(status: string) {
  if (status === "in_progress") return "In Progress";
  if (status === "scheduled") return "Scheduled";
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

function getContentStatusClasses(status: string) {
  if (status === "published") {
    return "bg-[#DCFCE7] text-[#16A34A]";
  }

  if (status === "scheduled") {
    return "bg-[#DBEAFE] text-[#2563EB]";
  }

  if (status === "in_progress") {
    return "bg-[#FEF3C7] text-[#D97706]";
  }

  return "bg-[#F3F4F6] text-[#6B7280]";
}

function getAutomationStatusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  if (status === "error") return "Error";
  return "Draft";
}

function getAutomationStatusClasses(status: string) {
  if (status === "active") {
    return "bg-[#DBEAFE] text-[#2563EB]";
  }

  if (status === "paused") {
    return "bg-[#FEF3C7] text-[#D97706]";
  }

  if (status === "error") {
    return "bg-[#FEE2E2] text-[#DC2626]";
  }

  return "bg-[#F3F4F6] text-[#6B7280]";
}

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <p className="text-sm text-[#9CA3AF]">Loading client...</p>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <Link
          href="/clients"
          className="mb-6 inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Clients
        </Link>

        <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-10 text-center">
          <h1 className="text-lg font-semibold text-[#111111]">
            Client not found
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            This client could not be found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
      <Link
        href="/clients"
        className="mb-6 inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
      >
        ← Back to Clients
      </Link>

      {editing ? (
  <div className="max-w-xl">
    <div className="space-y-4">
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Client name"
        className="w-full rounded-md border border-[#D1D5DB] px-3 py-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
      />

      <input
        type="email"
        value={editEmail}
        onChange={(e) => setEditEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-md border border-[#D1D5DB] px-3 py-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
      />
    </div>

    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={saveClientChanges}
        className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
      >
        Save Changes
      </button>

      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <div>
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-semibold text-[#111111]">
        {client.name}
      </h1>

      <button
        type="button"
        onClick={() => {
          setEditName(client.name);
          setEditEmail(client.email ?? "");
          setEditing(true);
        }}
        className="text-[#9CA3AF] transition hover:text-[#111111]"
        aria-label="Edit client"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>

    {client.email && (
      <p className="mt-2 text-sm text-[#6B7280]">
        {client.email}
      </p>
    )}
  </div>
)}

      <section className="mt-8">
       <div className="flex items-center gap-2">
  <h2 className="text-lg font-semibold text-[#111111]">
    Projects
  </h2>

  <span className="text-sm text-[#9CA3AF]">
    {projects.length}
  </span>
</div>

        {projects.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
            <h3 className="text-base font-medium text-[#111111]">
              No projects yet
            </h3>

            <p className="mt-2 text-sm text-[#6B7280]">
              This client is not connected to any projects yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#111111] md:text-base">
                      {project.name}
                    </p>

                    {project.description && (
                      <p className="mt-1 truncate text-sm text-[#9CA3AF]">
                        {project.description}
                      </p>
                    )}

{projectTaskCounts[project.id]?.total > 0 && (
  <p className="mt-1 text-xs text-[#9CA3AF]">
    {projectTaskCounts[project.id].completed} /{" "}
    {projectTaskCounts[project.id].total} tasks completed
  </p>
)}

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

<section className="mt-10">
  <div className="flex items-center gap-2">
    <h2 className="text-lg font-semibold text-[#111111]">
      Content
    </h2>

    <span className="text-sm text-[#9CA3AF]">
      {contentItems.length}
    </span>
  </div>

  {contentItems.length === 0 ? (
    <div className="mt-4 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
      <h3 className="text-base font-medium text-[#111111]">
        No content yet
      </h3>

      <p className="mt-2 text-sm text-[#6B7280]">
        This client is not connected to any content yet.
      </p>
    </div>
  ) : (
    <div className="mt-4 space-y-3">
      {contentItems.map((content) => (
        <Link
          key={content.id}
          href={`/content/${content.id}`}
          className="block rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#111111] md:text-base">
                {content.title}
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                {content.content_type === "post"
                  ? "Post"
                  : content.content_type === "thread"
                  ? "Thread"
                  : content.content_type === "video"
                  ? "Video"
                  : content.content_type === "article"
                  ? "Article"
                  : content.content_type === "newsletter"
                  ? "Newsletter"
                  : content.content_type}
                {" • "}
                {content.platform === "x"
                  ? "X"
                  : content.platform}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getContentStatusClasses(
                content.status
              )}`}
            >
              {getContentStatusLabel(content.status)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )}
</section>


<section className="mt-10">
  <div className="flex items-center gap-2">
    <h2 className="text-lg font-semibold text-[#111111]">
      Automations
    </h2>

    <span className="text-sm text-[#9CA3AF]">
      {automations.length}
    </span>
  </div>

  {automations.length === 0 ? (
    <div className="mt-4 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
      <h3 className="text-base font-medium text-[#111111]">
        No automations yet
      </h3>

      <p className="mt-2 text-sm text-[#6B7280]">
        This client is not connected to any automations yet.
      </p>
    </div>
  ) : (
    <div className="mt-4 space-y-3">
      {automations.map((automation) => (
        <Link
          key={automation.id}
          href={`/automations/${automation.id}`}
          className="block rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#111111] md:text-base">
                {automation.name}
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                {automation.tool}
                {automation.trigger && (
                  <>
                    {" • "}
                    {automation.trigger}
                  </>
                )}
              </p>

              {automation.action && (
                <p className="mt-1 truncate text-xs text-[#6B7280]">
                  Action: {automation.action}
                </p>
              )}
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getAutomationStatusClasses(
                automation.status
              )}`}
            >
              {getAutomationStatusLabel(automation.status)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )}
</section>

    </main>
  );
}