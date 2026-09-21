"use client";

import { useEffect, useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "../utils/client";

type Project = {
  id: number;
  name: string;
  status: string;
  description: string | null;
  client_id: number | null;
  created_at: string;
};

type ContentItem = {
  id: number;
  title: string;
  project_id: number | null;
};

type Automation = {
  id: number;
  name: string;
  project_id: number | null;
};

export default function ProjectsPage() {
  const supabase = createClient();
  const formRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(
    null
  );

  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("active");
  const [projectDescription, setProjectDescription] = useState("");
  const [clients, setClients] = useState<
  { id: number; name: string }[]
>([]);
const [projectClientId, setProjectClientId] = useState("");
const [projectTaskCounts, setProjectTaskCounts] = useState<
  Record<number, { total: number; completed: number }>
>({});

  useEffect(() => {
    async function loadProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, description, client_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
  alert(error.message);
  setLoading(false);
  return;
}

if (data) {
  setProjects(data);

  if (data.length > 0) {
    const projectIds = data.map((project) => project.id);

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

      data.forEach((project) => {
        counts[project.id] = {
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
}

setLoading(false);
    }

    loadProjects();
  }, []);


useEffect(() => {
  async function loadClients() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setClients(data);
    }
  }

  loadClients();
}, []);

useEffect(() => {
  async function loadContent() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("content_items")
      .select("id, title, project_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setContentItems(data ?? []);
  }

  loadContent();
}, []);

useEffect(() => {
  async function loadAutomations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("automations")
      .select("id, name, project_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setAutomations(data ?? []);
  }

  loadAutomations();
}, []);

  function openNewProject() {
  setEditingProjectId(null);
  setProjectName("");
  setProjectStatus("active");
  setProjectDescription("");
  setProjectClientId("");
  setShowForm(true);
}

  function closeForm() {
  setEditingProjectId(null);
  setProjectName("");
  setProjectStatus("active");
  setProjectDescription("");
  setProjectClientId("");
  setShowForm(false);
}

  function editProject(project: Project) {
  setEditingProjectId(project.id);
  setProjectName(project.name);
  setProjectStatus(project.status);
  setProjectDescription(project.description ?? "");
  setProjectClientId(project.client_id?.toString() ?? "");
setShowForm(true);

setTimeout(() => {
  formRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}, 0);
}

  async function saveProject() {
    if (!projectName.trim()) {
      return;
    }

    if (editingProjectId) {
      const { error } = await supabase
        .from("projects")
        .update({
  name: projectName.trim(),
  status: projectStatus,
  description: projectDescription.trim() || null,
  client_id: projectClientId ? Number(projectClientId) : null,
})
        .eq("id", editingProjectId);

      if (error) {
        alert(error.message);
        return;
      }

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProjectId
            ? {
                ...project,
                name: projectName.trim(),
                status: projectStatus,
              }
            : project
        )
      );
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
  user_id: user.id,
  name: projectName.trim(),
  status: projectStatus,
  description: projectDescription.trim() || null,
  client_id: projectClientId ? Number(projectClientId) : null,
})
        .select("id, name, status, description, client_id, created_at")
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setProjects((currentProjects) => [data, ...currentProjects]);
      }
    }

    closeForm();
  }

  async function deleteProject(id: number) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== id)
    );
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

  return (
   <main className="min-h-screen bg-[#F8F9FA] p-8">
        {/* Header */}
<a
  href="/dashboard"
  className="mb-6 inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
>
  ← Back to Dashboard
</a>

<div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-semibold text-[#111111]">
      Projects
    </h1>

    <p className="mt-2 text-sm text-[#6B7280]">
      Manage your projects in one place.
    </p>
  </div>

  <button
    type="button"
    onClick={() => setShowForm((current) => !current)}
    className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
  >
    + New Project
  </button>
</div>

        {/* New / Edit Project Form */}
      {showForm && (
  <div
    ref={formRef}
    className="mt-8 max-w-xl mx-auto rounded-lg border border-[#E5E7EB] bg-white p-6"
  >
    <h2 className="text-lg font-semibold text-[#111111]">
  {editingProjectId ? "Edit Project" : "New Project"}
</h2>

    <div className="mt-5 space-y-4">
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name"
        className="w-full rounded-md border border-[#D1D5DB] px-3 py-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
      />

<textarea
  value={projectDescription}
  onChange={(e) => setProjectDescription(e.target.value)}
  placeholder="Project description"
  rows={3}
  className="w-full resize-none rounded-md border border-[#D1D5DB] px-3 py-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
/>

<select
  value={projectClientId}
  onChange={(e) => setProjectClientId(e.target.value)}
  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-3 text-base text-[#111111] outline-none focus:border-[#111111]"
>
  <option value="">No client</option>

  {clients.map((client) => (
    <option key={client.id} value={client.id}>
      {client.name}
    </option>
  ))}
</select>



      <select
        value={projectStatus}
        onChange={(e) => setProjectStatus(e.target.value)}
        className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-3 text-base text-[#111111] outline-none focus:border-[#111111]"
      >
        <option value="active">Active</option>
        <option value="on_hold">On Hold</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={saveProject}
        className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
      >
        {editingProjectId ? "Save Changes" : "Add Project"}
      </button>

      <button
        type="button"
        onClick={closeForm}
        className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
      >
        Cancel
      </button>
    </div>
  </div>
)}

        {/* Projects */}
        <div className="mt-8">
          {loading ? (
  <div className="py-10 text-center text-sm text-[#9CA3AF]">
    Loading projects...
  </div>
) : projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
              <h2 className="text-lg font-medium text-[#111111]">
                No projects yet
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Create your first project to start organizing your work.
              </p>

              <button
                type="button"
                onClick={openNewProject}
                className="mt-5 rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
              >
                + New Project
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {projects.map((project) => (
                <div
  key={project.id}
  role="link"
  tabIndex={0}
  onClick={() => {
    window.location.href = `/projects/${project.id}`;
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = `/projects/${project.id}`;
    }
  }}
  className="grid cursor-pointer grid-cols-1 gap-4 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC] lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center"
>
                  <div className="min-w-0 flex-1">
  <p className="truncate text-sm font-medium text-[#111111] md:text-base">
    {project.name}
  </p>

{projectTaskCounts[project.id]?.total > 0 && (
  <p className="mt-1 text-xs text-[#9CA3AF]">
    {projectTaskCounts[project.id].completed} /{" "}
    {projectTaskCounts[project.id].total} tasks completed
  </p>
)}

</div>

<div className="min-w-0">
  <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
    Content
  </p>

  <p className="mt-1 truncate text-sm text-[#6B7280]">
    {contentItems
      .filter((item) => item.project_id === project.id)
      .map((item) => item.title)
      .join(", ") || "No content"}
  </p>
</div>

<div className="min-w-0">
  <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
    Automations
  </p>

  <p className="mt-1 truncate text-sm text-[#6B7280]">
    {automations
      .filter((item) => item.project_id === project.id)
      .map((item) => item.name)
      .join(", ") || "No automations"}
  </p>
</div>

                  <div className="flex items-center justify-end gap-3">

{project.client_id && (
  <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#6B7280]">
    {clients.find((client) => client.id === project.client_id)?.name}
  </span>
)}




                    <span
  className={`rounded-full px-3 py-1 text-xs font-medium ${
    project.status === "active"
      ? "bg-[#DBEAFE] text-[#2563EB]"
      : project.status === "on_hold"
      ? "bg-[#FEF3C7] text-[#D97706]"
      : "bg-[#DCFCE7] text-[#16A34A]"
  }`}
>
  {getStatusLabel(project.status)}
</span>

                    <button
                      type="button"
                      onClick={(e) => {
  e.stopPropagation();
  editProject(project);
}}
                      className="text-[#9CA3AF] transition hover:text-[#111111]"
                      aria-label="Edit project"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
  e.stopPropagation();
  deleteProject(project.id);
}}
                      className="text-[#9CA3AF] transition hover:text-red-500"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    
    </main>
  );
}