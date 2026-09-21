"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../utils/client";

const supabase = createClient();

type Automation = {
  id: number;
  name: string;
  tool: string;
  trigger: string | null;
  action: string | null;
  status: string;
  description: string | null;
  client_id: number | null;
  project_id: number | null;
  notes: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
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

const tools = [
  { value: "make", label: "Make" },
  { value: "n8n", label: "n8n" },
  { value: "zapier", label: "Zapier" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "error", label: "Error" },
];

function getToolLabel(tool: string) {
  return tools.find((item) => item.value === tool)?.label ?? tool;
}

function getStatusLabel(status: string) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function getStatusClasses(status: string) {
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

function formatDate(date: string | null) {
  if (!date) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AutomationDetailPage() {
  const params = useParams<{ id: string }>();

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [tool, setTool] = useState("make");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("draft");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [lastRunAt, setLastRunAt] = useState("");
  const [nextRunAt, setNextRunAt] = useState("");

  useEffect(() => {
    loadAutomation();
  }, []);

  async function loadAutomation() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: automationData, error } = await supabase
      .from("automations")
      .select("*")
      .eq("id", Number(params.id))
      .eq("user_id", user.id)
      .single();

    if (error || !automationData) {
      setLoading(false);
      return;
    }

    const [{ data: clientsData }, { data: projectsData }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),

        supabase
          .from("projects")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),
      ]);

    const foundClient =
      clientsData?.find(
        (item) => item.id === automationData.client_id
      ) || null;

    const foundProject =
      projectsData?.find(
        (item) => item.id === automationData.project_id
      ) || null;

    setAutomation(automationData);
    setClients(clientsData || []);
    setProjects(projectsData || []);
    setClient(foundClient);
    setProject(foundProject);

    setName(automationData.name);
    setTool(automationData.tool);
    setTrigger(automationData.trigger || "");
    setAction(automationData.action || "");
    setStatus(automationData.status);
    setDescription(automationData.description || "");
    setClientId(
      automationData.client_id
        ? String(automationData.client_id)
        : ""
    );
    setProjectId(
      automationData.project_id
        ? String(automationData.project_id)
        : ""
    );
    setNotes(automationData.notes || "");

    setLastRunAt(
      automationData.last_run_at
        ? new Date(automationData.last_run_at)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setNextRunAt(
      automationData.next_run_at
        ? new Date(automationData.next_run_at)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setLoading(false);
  }

  function startEditing() {
    setEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    if (!automation) {
      return;
    }

    setName(automation.name);
    setTool(automation.tool);
    setTrigger(automation.trigger || "");
    setAction(automation.action || "");
    setStatus(automation.status);
    setDescription(automation.description || "");
    setClientId(
      automation.client_id
        ? String(automation.client_id)
        : ""
    );
    setProjectId(
      automation.project_id
        ? String(automation.project_id)
        : ""
    );
    setNotes(automation.notes || "");

    setLastRunAt(
      automation.last_run_at
        ? new Date(automation.last_run_at)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setNextRunAt(
      automation.next_run_at
        ? new Date(automation.next_run_at)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setEditing(false);
  }

  async function saveChanges() {
    if (!automation || !name.trim()) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const payload = {
      name: name.trim(),
      tool,
      trigger: trigger.trim() || null,
      action: action.trim() || null,
      status,
      description: description.trim() || null,
      client_id: clientId ? Number(clientId) : null,
      project_id: projectId ? Number(projectId) : null,
      notes: notes.trim() || null,
      last_run_at: lastRunAt
        ? new Date(lastRunAt).toISOString()
        : null,
      next_run_at: nextRunAt
        ? new Date(nextRunAt).toISOString()
        : null,
    };

    const { error } = await supabase
      .from("automations")
      .update(payload)
      .eq("id", automation.id)
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAutomation();
    setEditing(false);
  }

  async function deleteAutomation() {
    if (!automation) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this automation?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("automations")
      .delete()
      .eq("id", automation.id);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/automations";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <p className="text-sm text-[#9CA3AF]">
          Loading automation...
        </p>
      </main>
    );
  }

  if (!automation) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <a
          href="/automations"
          className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Automations
        </a>

        <div className="mt-10 rounded-lg border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
          <h1 className="text-base font-semibold text-[#111111]">
            Automation not found
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            This automation could not be found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
      <a
        href="/automations"
        className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
      >
        ← Back to Automations
      </a>

      {!editing ? (
        <>
          <div className="mb-8 mt-8 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
                  {automation.name}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                    automation.status
                  )}`}
                >
                  {getStatusLabel(automation.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#6B7280]">
                {getToolLabel(automation.tool)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs text-[#6B7280]">Client</p>

              {client ? (
                <a
                  href={`/clients/${client.id}`}
                  className="mt-2 block text-sm font-medium text-[#111111] transition hover:underline"
                >
                  {client.name}
                </a>
              ) : (
                <p className="mt-2 text-sm text-[#9CA3AF]">
                  No client
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs text-[#6B7280]">Project</p>

              {project ? (
                <a
                  href={`/projects/${project.id}`}
                  className="mt-2 block text-sm font-medium text-[#111111] transition hover:underline"
                >
                  {project.name}
                </a>
              ) : (
                <p className="mt-2 text-sm text-[#9CA3AF]">
                  No project
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
  <p className="text-xs text-[#6B7280]">Last Run</p>

  <p className="mt-2 text-sm font-medium text-[#111111]">
    {formatDate(automation.last_run_at)}
  </p>
</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111111]">
                Trigger
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#111111]">
                {automation.trigger || "No trigger added yet."}
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111111]">
                Action
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#111111]">
                {automation.action || "No action added yet."}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111111]">
              Description
            </h2>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#111111]">
              {automation.description || "No description added yet."}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs text-[#6B7280]">Last Run</p>

              <p className="mt-2 text-sm font-medium text-[#111111]">
                {formatDate(automation.last_run_at)}
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <p className="text-xs text-[#6B7280]">Next Run</p>

              <p className="mt-2 text-sm font-medium text-[#111111]">
                {formatDate(automation.next_run_at)}
              </p>
            </div>
          </div>

          {automation.notes && (
            <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111111]">
                Notes
              </h2>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6B7280]">
                {automation.notes}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-2 rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              onClick={deleteAutomation}
              className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:text-[#DC2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-[#111111]">
              Edit Automation
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Update your automation details.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Tool
                </label>

                <select
                  value={tool}
                  onChange={(e) => setTool(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                >
                  {tools.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                >
                  {statuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                Trigger
              </label>

              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                Action
              </label>

              <input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Client
                </label>

                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                >
                  <option value="">No client</option>

                  {clients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Project
                </label>

                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                >
                  <option value="">No project</option>

                  {projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Last Run
                </label>

                <input
                  type="datetime-local"
                  value={lastRunAt}
                  onChange={(e) => setLastRunAt(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Next Run
                </label>

                <input
                  type="datetime-local"
                  value={nextRunAt}
                  onChange={(e) => setNextRunAt(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveChanges}
                className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#FCFCFC]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}