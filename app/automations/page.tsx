"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "../utils/client";

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
  return (
    statuses.find((item) => item.value === status)?.label ?? status
  );
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
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<number | null>(
    null
  );

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
    loadData();
  }, []);

  async function loadData() {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return;
    }

    const [
      { data: automationData },
      { data: clientsData },
      { data: projectsData },
    ] = await Promise.all([
      supabase
        .from("automations")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", authData.user.id)
        .order("name", { ascending: true }),

      supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", authData.user.id)
        .order("name", { ascending: true }),
    ]);

    setAutomations(automationData || []);
    setClients(clientsData || []);
    setProjects(projectsData || []);
  }

  function resetForm() {
    setName("");
    setTool("make");
    setTrigger("");
    setAction("");
    setStatus("draft");
    setDescription("");
    setClientId("");
    setProjectId("");
    setNotes("");
    setLastRunAt("");
    setNextRunAt("");
    setEditingAutomationId(null);
    setShowForm(false);
  }

  function startEditing(automation: Automation) {
    setName(automation.name);
    setTool(automation.tool);
    setTrigger(automation.trigger || "");
    setAction(automation.action || "");
    setStatus(automation.status);
    setDescription(automation.description || "");
    setClientId(
      automation.client_id ? String(automation.client_id) : ""
    );
    setProjectId(
      automation.project_id ? String(automation.project_id) : ""
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

    setEditingAutomationId(automation.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveAutomation() {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user || !name.trim()) {
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

    if (editingAutomationId) {
      const { error } = await supabase
        .from("automations")
        .update(payload)
        .eq("id", editingAutomationId)
        .eq("user_id", authData.user.id);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from("automations").insert({
        ...payload,
        user_id: authData.user.id,
      });

      if (error) {
        console.error(error);
        return;
      }
    }

    await loadData();
    resetForm();
  }

  async function deleteAutomation(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this automation?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("automations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setAutomations((current) =>
      current.filter((automation) => automation.id !== id)
    );
  }

  function getClientName(clientId: number | null) {
    if (!clientId) return null;

    return (
      clients.find((client) => client.id === clientId)?.name || null
    );
  }

  function getProjectName(projectId: number | null) {
    if (!projectId) return null;

    return (
      projects.find((project) => project.id === projectId)?.name || null
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <a
          href="/dashboard"
          className="mb-8 block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Dashboard
        </a>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
              Automations
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Build, organize, and manage your automation workflows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm && !editingAutomationId) {
                resetForm();
                return;
              }

              setShowForm(true);
            }}
            className="whitespace-nowrap rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
          >
            + New Automation
          </button>
        </div>

        {showForm && (
          <div className="mx-auto mb-8 max-w-xl rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[#111111]">
                {editingAutomationId
                  ? "Edit Automation"
                  : "New Automation"}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Define how this automation should work.
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
                  placeholder="Enter an automation name"
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
                  placeholder="e.g. New client created"
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
                  placeholder="e.g. Send welcome email"
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
                  placeholder="Describe what this automation does..."
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

                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
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

                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
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
                  placeholder="Optional notes"
                  rows={4}
                  className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveAutomation}
                  className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
                >
                  {editingAutomationId
                    ? "Save Changes"
                    : "Create Automation"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#FCFCFC]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {automations.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              No automations yet
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              Create your first automation to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {automations.map((automation) => {
              const clientName = getClientName(automation.client_id);
              const projectName = getProjectName(
                automation.project_id
              );

              return (
                <div
  key={automation.id}
  onClick={() => {
    window.location.href = `/automations/${automation.id}`;
  }}
  className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:bg-[#FCFCFC]"
>
                  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.6fr_0.9fr_1fr_1fr_1.2fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#111111]">
                        {automation.name}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                        <span>{getToolLabel(automation.tool)}</span>

                        {automation.trigger && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {automation.trigger}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Client
                      </p>

                      <p className="mt-1 truncate text-sm text-[#6B7280]">
                        {clientName || "No client"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Project
                      </p>

                      <p className="mt-1 truncate text-sm text-[#6B7280]">
                        {projectName || "No project"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Next Run
                      </p>

                      <p className="mt-1 text-sm text-[#6B7280]">
                        {formatDate(automation.next_run_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Action
                      </p>

                      <p className="mt-1 truncate text-sm text-[#6B7280]">
                        {automation.action || "No action"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          automation.status
                        )}`}
                      >
                        {getStatusLabel(automation.status)}
                      </span>

                      <div className="flex items-center gap-2">
  <button
    type="button"
    onClick={(e) => {
  e.stopPropagation();
  startEditing(automation);
}}
    className="rounded-md p-1.5 text-[#9CA3AF] transition hover:text-[#111111]"
    aria-label="Edit automation"
  >
    <Pencil className="h-4 w-4" />
  </button>

  <button
    type="button"
    onClick={(e) => {
  e.stopPropagation();
  deleteAutomation(automation.id);
}}
    className="rounded-md p-1.5 text-[#9CA3AF] transition hover:text-[#DC2626]"
    aria-label="Delete automation"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}