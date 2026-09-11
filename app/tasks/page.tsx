import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_access")
    .eq("user_id", user.id)
    .single();

  if (!profile?.has_access) {
    redirect("/");
  }

  async function createTask(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const dueDate = String(formData.get("due_date") || "").trim();
    const dueTime = String(formData.get("due_time") || "").trim();

    if (!title) {
      return;
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      due_date: dueDate
  ? new Date(`${dueDate}T${dueTime || "23:59"}:00`).toISOString()
  : null,
    });

    redirect("/dashboard?refresh=1");
  }

  async function deleteTask(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !id) {
    return;
  }

  await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  redirect("/tasks");
}

const { data: tasks } = await supabase
  .from("tasks")
  .select("id, title, completed, due_date")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <a
          href="/dashboard"
          className="text-sm text-[#6B7280] hover:text-[#111111]"
        >
          ← Back to dashboard
        </a>

        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <p className="text-sm text-[#6B7280]">Workspace</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111111]">
            New Task
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Add a task to your workspace.
          </p>

          <form action={createTask} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[#111111]"
              >
                Task
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Send proposal to client"
                required
                className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]"
              />
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="block text-sm font-medium text-[#111111]"
              >
                Due date
              </label>

              <input
                id="due_date"
                name="due_date"
                type="date"
                className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#111111]"
              />
              <div>
  <label
    htmlFor="due_time"
    className="block text-sm font-medium text-[#111111]"
  >
    Time
  </label>

  <input
    id="due_time"
    name="due_time"
    type="time"
    className="mt-2 h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#111111]"
  />
</div>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#111111] text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              Create task
            </button>
          </form>
        </div>
        <div className="mt-8">
  <h2 className="text-sm font-semibold text-[#111111]">Your tasks</h2>

  <div className="mt-4 space-y-2">
    {tasks?.map((task) => (
      <div
        key={task.id}
        className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-3"
      >
        <span className="text-sm text-[#111111]">{task.title}</span>

        <form action={deleteTask}>
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className="text-sm text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </form>
      </div>
    ))}
  </div>
</div>
      </div>
    </main>
  );
}