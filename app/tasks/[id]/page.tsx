"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../utils/client";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  due_date: string | null;
  project_id: number | null;
};

type Project = {
  id: number;
  name: string;
  client_id: number | null;
};

type Client = {
  id: number;
  name: string;
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function loadTask() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const taskId = Number(params.id);

      if (!taskId) {
        setLoading(false);
        return;
      }

      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("id, title, completed, due_date, project_id")
        .eq("id", taskId)
        .eq("user_id", user.id)
        .single();

      if (taskError) {
        console.error(taskError);
        setLoading(false);
        return;
      }

      setTask(taskData);

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name, client_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (projectError) {
        console.error(projectError);
      } else {
        setProjects(projectData ?? []);
      }

      if (taskData.project_id) {
        const { data: currentProject, error: currentProjectError } =
          await supabase
            .from("projects")
            .select("id, name, client_id")
            .eq("id", taskData.project_id)
            .eq("user_id", user.id)
            .single();

        if (currentProjectError) {
          console.error(currentProjectError);
        } else if (currentProject) {
          setProject(currentProject);

          if (currentProject.client_id) {
            const { data: clientData, error: clientError } = await supabase
              .from("clients")
              .select("id, name")
              .eq("id", currentProject.client_id)
              .eq("user_id", user.id)
              .single();

            if (clientError) {
              console.error(clientError);
            } else {
              setClient(clientData);
            }
          }
        }
      }

      setLoading(false);
    }

    loadTask();
  }, [params.id]);

  function startEditing() {
    if (!task) {
      return;
    }

    setTaskTitle(task.title);
    setTaskProjectId(task.project_id?.toString() ?? "");

    if (task.due_date) {
      const date = new Date(task.due_date);

      setTaskDueDate(
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      );

      setTaskDueTime(
        `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`
      );
    } else {
      setTaskDueDate("");
      setTaskDueTime("");
    }

    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function saveTask() {
    if (!task || !taskTitle.trim()) {
      return;
    }

    const dueDate = taskDueDate
      ? new Date(
          `${taskDueDate}T${taskDueTime || "23:59"}`
        ).toISOString()
      : null;

    const newProjectId = taskProjectId
      ? Number(taskProjectId)
      : null;

    const { error } = await supabase
      .from("tasks")
      .update({
        title: taskTitle.trim(),
        due_date: dueDate,
        project_id: newProjectId,
      })
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTask({
      ...task,
      title: taskTitle.trim(),
      due_date: dueDate,
      project_id: newProjectId,
    });

    const newProject =
      newProjectId !== null
        ? projects.find((item) => item.id === newProjectId) ?? null
        : null;

    setProject(newProject);

    if (newProject?.client_id) {
      const {
        data: clientData,
        error: clientError,
      } = await supabase
        .from("clients")
        .select("id, name")
        .eq("id", newProject.client_id)
        .single();

      if (clientError) {
        console.error(clientError);
        setClient(null);
      } else {
        setClient(clientData);
      }
    } else {
      setClient(null);
    }

    setEditing(false);
  }

  async function toggleCompleted() {
    if (!task) {
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
      })
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTask({
      ...task,
      completed: !task.completed,
    });
  }

  async function deleteTask() {
    if (!task) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (project) {
      router.push(`/projects/${project.id}`);
    } else {
      router.push("/tasks");
    }
  }

  function formatDueDate(dateString: string | null) {
    if (!dateString) {
      return null;
    }

    return new Date(dateString).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isDueToday(dateString: string | null) {
    if (!dateString) {
      return false;
    }

    const dueDate = new Date(dateString);
    const today = new Date();

    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <p className="text-sm text-[#9CA3AF]">
          Loading task...
        </p>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <Link
          href="/tasks"
          className="text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Tasks
        </Link>

        <div className="mt-8 rounded-lg border border-[#E5E7EB] bg-white px-6 py-10 text-center">
          <h1 className="text-lg font-semibold text-[#111111]">
            Task not found
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            This task could not be found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="space-y-2">
        <Link
  href="/dashboard"
  className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
>
  ← Back to Dashboard
</Link>

        {project && (
          <Link
            href={`/projects/${project.id}`}
            className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
          >
            ← Back to Project
          </Link>
        )}
      </div>

      {editing ? (
        <div className="mt-8 max-w-xl">
          <h1 className="text-2xl font-semibold text-[#111111]">
            Edit Task
          </h1>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-[#111111]"
              >
                Task
              </label>

              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label
                htmlFor="task-project"
                className="block text-sm font-medium text-[#111111]"
              >
                Project
              </label>

              <select
                id="task-project"
                value={taskProjectId}
                onChange={(e) =>
                  setTaskProjectId(e.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="">No project</option>

                {projects.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-date"
                  className="block text-sm font-medium text-[#111111]"
                >
                  Due date
                </label>

                <input
                  id="task-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) =>
                    setTaskDueDate(e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label
                  htmlFor="task-time"
                  className="block text-sm font-medium text-[#111111]"
                >
                  Time
                </label>

                <input
                  id="task-time"
                  type="time"
                  value={taskDueTime}
                  onChange={(e) =>
                    setTaskDueTime(e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={saveTask}
              className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={
                task.completed
                  ? "text-2xl font-semibold text-[#9CA3AF] line-through"
                  : "text-2xl font-semibold text-[#111111]"
              }
            >
              {task.title}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                task.completed
                  ? "bg-[#DCFCE7] text-[#16A34A]"
                  : "bg-[#DBEAFE] text-[#2563EB]"
              }`}
            >
              {task.completed ? "Completed" : "Active"}
            </span>
          </div>

          {project && (
            <Link
              href={`/projects/${project.id}`}
              className="mt-4 inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
            >
              Project: {project.name}
            </Link>
          )}

          {client && (
            <Link
              href={`/clients/${client.id}`}
              className="mt-2 inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
            >
              Client: {client.name}
            </Link>
          )}

          <div className="mt-6 max-w-2xl rounded-lg border border-[#E5E7EB] bg-white px-5 py-5">
            <p className="text-sm font-medium text-[#111111]">
              Due date
            </p>

            {task.due_date ? (
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <p className="text-sm text-[#6B7280]">
                  {formatDueDate(task.due_date)}
                </p>

                {isDueToday(task.due_date) &&
                  !task.completed && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-medium text-orange-600">
                      Due today
                    </span>
                  )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-[#9CA3AF]">
                No due date
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleCompleted}
              className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              {task.completed
                ? "Mark as Active"
                : "Mark as Completed"}
            </button>

            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              onClick={deleteTask}
              className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5] hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </main>
  );
}