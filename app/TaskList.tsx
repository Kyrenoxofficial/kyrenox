"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "./utils/client";
import { Pencil, Trash2 } from "lucide-react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  due_date: string | null;
};

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const supabase = createClient();
  const router = useRouter();

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
        task.id === id ? { ...task, completed: !completed } : task
      )
    );
    router.refresh();
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
  router.refresh();
}

function editTask(task: Task) {
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
  router.refresh();
}return (
  <div className="mt-6 space-y-4">
    {showEditForm && (
  <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-white p-5">
    <input
      type="text"
      value={taskTitle}
      onChange={(e) => setTaskTitle(e.target.value)}
      placeholder="Task title"
      className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
    />

    <div className="mt-3 flex gap-3">
      <input
        type="date"
        value={taskDueDate}
        onChange={(e) => setTaskDueDate(e.target.value)}
        className="rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#111111]"
      />

      <input
        type="time"
        value={taskDueTime}
        onChange={(e) => setTaskDueTime(e.target.value)}
        className="rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#111111]"
      />
   <div className="mt-4">
  <button
    type="button"
    onClick={saveTask}
    className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
  >
    Save Changes
  </button>
</div>
 </div>
  </div>
)}
    {tasks.map((task) => (
      <div
        key={task.id}
        className="flex items-center justify-between text-sm"
      >
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id, task.completed)}
            className="h-4 w-4 rounded border-[#D1D5DB]"
          />

         <div>
  <span
    className={
      task.completed ? "text-[#9CA3AF] line-through" : ""
    }
  >
    {task.title}
  </span>

  {task.due_date && (
  <div className="mt-1 flex items-center gap-2">
    {new Date(task.due_date).toDateString() === new Date().toDateString() && (
      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
        Due today
      </span>
    )}

    <p className="text-xs text-[#9CA3AF]">
      {new Date(task.due_date).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  </div>
)}
</div>
        </label>

<div className="flex items-center gap-3">

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
    ))}
  </div>
);
}