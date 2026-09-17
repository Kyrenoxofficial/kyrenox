"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../utils/client";
import { Pencil, Trash2 } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();

  const supabase = createClient();

  const [project, setProject] = useState<{
  id: number;
  name: string;
  status: string;
  description: string | null;
  client_id: number | null;
} | null>(null);

const [client, setClient] = useState<{
  id: number;
  name: string;
} | null>(null);

  const [tasks, setTasks] = useState<
  {
    id: number;
    title: string;
    completed: boolean;
    due_date: string | null;
  }[]
>([]);

const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
const [taskTitle, setTaskTitle] = useState("");
const [taskDueDate, setTaskDueDate] = useState("");
const [taskDueTime, setTaskDueTime] = useState("");
const [showEditForm, setShowEditForm] = useState(false);
const [showAddTaskForm, setShowAddTaskForm] = useState(false);
const [newTaskTitle, setNewTaskTitle] = useState("");
const [newTaskDueDate, setNewTaskDueDate] = useState("");
const [newTaskDueTime, setNewTaskDueTime] = useState("");

async function addTaskToProject() {
  if (!newTaskTitle.trim()) {
    return;
  }

  const dueDate = newTaskDueDate
    ? new Date(
        `${newTaskDueDate}T${newTaskDueTime || "23:59"}`
      ).toISOString()
    : null;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      title: newTaskTitle.trim(),
      due_date: dueDate,
      project_id: Number(params.id),
    })
    .select("id, title, completed, due_date")
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  if (data) {
    setTasks((currentTasks) => [...currentTasks, data]);
  }

  setNewTaskTitle("");
  setNewTaskDueDate("");
  setNewTaskDueTime("");
  setShowAddTaskForm(false);
}


    useEffect(() => {
    async function loadProject() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, description, client_id")
        .eq("id", Number(params.id))
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setProject(data);
      }


      if (data?.client_id) {
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", data.client_id)
    .eq("user_id", user.id)
    .single();

  if (clientError) {
    console.error(clientError);
    return;
  }

  if (clientData) {
    setClient(clientData);
  }
}

const { data: projectTasks, error: tasksError } = await supabase
  .from("tasks")
  .select("id, title, completed, due_date")
  .eq("user_id", user.id)
  .eq("project_id", Number(params.id))
  .order("due_date", { ascending: true, nullsFirst: false });

if (tasksError) {
  console.error(tasksError);
  return;
}

if (projectTasks) {
  setTasks(projectTasks);
}

    }

    loadProject();
  }, [params.id]);


  async function toggleTask(id: number, completed: boolean) {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !completed }
          : task
      )
    );
  }


  async function deleteTask(id: number) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
  }


function editTask(task: {
  id: number;
  title: string;
  completed: boolean;
  due_date: string | null;
}) {
  setEditingTaskId(task.id);
  setTaskTitle(task.title);

  if (task.due_date) {
    const date = new Date(task.due_date);

    setTaskDueDate(date.toISOString().slice(0, 10));
    setTaskDueTime(date.toTimeString().slice(0, 5));
  } else {
    setTaskDueDate("");
    setTaskDueTime("");
  }

  setShowEditForm(true);
}


async function saveTask() {
  if (!editingTaskId || !taskTitle.trim()) {
    return;
  }

  const dueDate = taskDueDate
    ? new Date(`${taskDueDate}T${taskDueTime || "23:59"}`).toISOString()
    : null;

  const { error } = await supabase
    .from("tasks")
    .update({
      title: taskTitle.trim(),
      due_date: dueDate,
    })
    .eq("id", editingTaskId);

  if (error) {
    alert(error.message);
    return;
  }

  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === editingTaskId
        ? {
            ...task,
            title: taskTitle.trim(),
            due_date: dueDate,
          }
        : task
    )
  );

  setEditingTaskId(null);
  setTaskTitle("");
  setTaskDueDate("");
  setTaskDueTime("");
  setShowEditForm(false);
}

  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
      <a
        href="/projects"
        className="mb-6 inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
      >
        ← Back to Projects
      </a>

      <div>
  <div className="flex items-center gap-3">
    <h1 className="text-2xl font-semibold text-[#111111]">
      {project?.name ?? "Loading..."}
    </h1>

    {project && (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          project.status === "active"
            ? "bg-[#DBEAFE] text-[#2563EB]"
            : project.status === "on_hold"
            ? "bg-[#FEF3C7] text-[#D97706]"
            : "bg-[#DCFCE7] text-[#16A34A]"
        }`}
      >
        {project.status === "completed"
          ? "Completed"
          : project.status === "on_hold"
          ? "On Hold"
          : "Active"}
      </span>
    )}
  </div>

  <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
  {project?.description || "No description added yet."}
</p>

{client && (
  <div className="mt-3">
    <span className="inline-flex items-center rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111111]">
      Client: {client.name}
    </span>
  </div>
)}

{tasks.length > 0 && (
  <p className="mt-3 text-sm text-[#6B7280]">
    {completedTasks} / {tasks.length} tasks completed
  </p>
)}

</div>


{showEditForm && (
  <div className="mt-8 mb-8 max-w-xl mx-auto rounded-lg border border-[#E5E7EB] bg-white p-6">
    <h2 className="text-lg font-semibold text-[#111111]">
      Edit Task
    </h2>

    <div className="mt-4">
      <label
        htmlFor="edit-task-title"
        className="block text-sm font-medium text-[#111111]"
      >
        Task
      </label>

      <input
        id="edit-task-title"
        type="text"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
      />
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <label
          htmlFor="edit-task-date"
          className="block text-sm font-medium text-[#111111]"
        >
          Due date
        </label>

        <input
          id="edit-task-date"
          type="date"
          value={taskDueDate}
          onChange={(e) => setTaskDueDate(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
        />
      </div>

      <div>
        <label
          htmlFor="edit-task-time"
          className="block text-sm font-medium text-[#111111]"
        >
          Time
        </label>

        <input
          id="edit-task-time"
          type="time"
          value={taskDueTime}
          onChange={(e) => setTaskDueTime(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
        />
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
        onClick={() => {
          setEditingTaskId(null);
          setTaskTitle("");
          setTaskDueDate("");
          setTaskDueTime("");
          setShowEditForm(false);
        }}
        className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
      >
        Cancel
      </button>
    </div>
  </div>
)}


{showAddTaskForm && (
  <div className="mt-8 max-w-xl mx-auto rounded-lg border border-[#E5E7EB] bg-white p-6">
    <h2 className="text-lg font-semibold text-[#111111]">
      New Task
    </h2>

    <div className="mt-5">
      <label
        htmlFor="new-task-title"
        className="block text-sm font-medium text-[#111111]"
      >
        Task
      </label>

      <input
        id="new-task-title"
        type="text"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="e.g. Send proposal"
        className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
      />
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <label
          htmlFor="new-task-date"
          className="block text-sm font-medium text-[#111111]"
        >
          Due date
        </label>

        <input
          id="new-task-date"
          type="date"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
        />
      </div>

      <div>
        <label
          htmlFor="new-task-time"
          className="block text-sm font-medium text-[#111111]"
        >
          Time
        </label>

        <input
          id="new-task-time"
          type="time"
          value={newTaskDueTime}
          onChange={(e) => setNewTaskDueTime(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
        />
      </div>
    </div>

    <div className="mt-5 flex gap-3">
      <button
        type="button"
        onClick={addTaskToProject}
        className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
      >
        Add Task
      </button>

      <button
        type="button"
        onClick={() => {
          setNewTaskTitle("");
          setNewTaskDueDate("");
          setNewTaskDueTime("");
          setShowAddTaskForm(false);
        }}
        className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
      >
        Cancel
      </button>
    </div>
  </div>
)}

<div className="mt-8">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-semibold text-[#111111]">
      Tasks
    </h2>

    <button
  type="button"
  onClick={() => setShowAddTaskForm(true)}
  className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
>
  + Add Task
</button>
  </div>

  <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white px-4">
    {tasks.length === 0 ? (
      <div className="m-3 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
        <p className="text-sm text-[#6B7280]">
          No tasks in this project yet.
        </p>
      </div>
    ) : (
      tasks.map((task) => (
       <div
  key={task.id}
  className="flex items-start justify-between border-b border-[#E5E7EB] py-3 last:border-b-0"
>
  <label className="grid cursor-pointer grid-cols-[16px_1fr] items-start gap-3">
    <input
      type="checkbox"
      checked={task.completed}
      onChange={() => toggleTask(task.id, task.completed)}
      className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB]"
    />

    <div>
      <p
        className={
          task.completed
            ? "text-sm text-[#9CA3AF] line-through"
            : "text-sm text-[#111111]"
        }
      >
        {task.title}
      </p>

      {task.due_date && (
        <p className="mt-1 text-xs text-[#9CA3AF]">
          {new Date(task.due_date).toLocaleString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  </label>

  <div className="flex items-center gap-3">
  {task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString() && (
      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
        Due today
      </span>
    )}

  {task.completed && (
    <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-medium text-[#16A34A]">
      Completed
    </span>
  )}

  <button
    type="button"
    onClick={() => editTask(task)}
    className="text-[#9CA3AF] transition hover:text-[#111111]"
    aria-label="Edit task"
  >
    <Pencil className="h-4 w-4" />
  </button>

  <button
    type="button"
    onClick={() => deleteTask(task.id)}
    className="text-[#9CA3AF] transition hover:text-red-500"
    aria-label="Delete task"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
</div>
      ))
    )}
  </div>
</div>

    </main>
  );
}