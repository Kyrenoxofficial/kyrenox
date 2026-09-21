"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "../utils/client";

const supabase = createClient();

type ContentItem = {
  id: number;
  title: string;
  content_type: string;
  platform: string;
  status: string;
  publish_at: string | null;
  client_id: number | null;
  project_id: number | null;
  body: string | null;
  notes: string | null;
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

const contentTypes = [
  { value: "post", label: "Post" },
  { value: "thread", label: "Thread" },
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
  { value: "newsletter", label: "Newsletter" },
];

const platforms = [
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function getStatusLabel(status: string) {
  const found = statuses.find((item) => item.value === status);
  return found?.label ?? status;
}

function getStatusClasses(status: string) {
  if (status === "in_progress") {
    return "bg-[#FEF3C7] text-[#D97706]";
  }

  if (status === "scheduled") {
    return "bg-[#DBEAFE] text-[#2563EB]";
  }

  if (status === "published") {
    return "bg-[#DCFCE7] text-[#16A34A]";
  }

  if (status === "archived") {
    return "bg-[#F3F4F6] text-[#6B7280]";
  }

  return "bg-[#F3F4F6] text-[#6B7280]";
}

function formatDate(date: string | null) {
  if (!date) return "No publish date";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingContentId, setEditingContentId] = useState<number | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("post");
  const [platform, setPlatform] = useState("x");
  const [status, setStatus] = useState("draft");
  const [publishAt, setPublishAt] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return;
    }

    const [
      { data: contentData },
      { data: clientsData },
      { data: projectsData },
    ] = await Promise.all([
      supabase
        .from("content_items")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("publish_at", {
          ascending: true,
          nullsFirst: false,
        }),
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

    setContentItems(contentData || []);
    setClients(clientsData || []);
    setProjects(projectsData || []);
  }

  function resetForm() {
    setTitle("");
    setContentType("post");
    setPlatform("x");
    setStatus("draft");
    setPublishAt("");
    setClientId("");
    setProjectId("");
    setBody("");
    setNotes("");
    setEditingContentId(null);
    setShowForm(false);
  }

  function startEditing(item: ContentItem) {
    setTitle(item.title);
    setContentType(item.content_type);
    setPlatform(item.platform);
    setStatus(item.status);
    setPublishAt(
      item.publish_at
        ? new Date(item.publish_at).toISOString().slice(0, 16)
        : ""
    );
    setClientId(item.client_id ? String(item.client_id) : "");
    setProjectId(item.project_id ? String(item.project_id) : "");
    setBody(item.body || "");
    setNotes(item.notes || "");
    setEditingContentId(item.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveContent() {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user || !title.trim()) {
      return;
    }

    const payload = {
      title: title.trim(),
      content_type: contentType,
      platform,
      status,
      publish_at: publishAt
        ? new Date(publishAt).toISOString()
        : null,
      client_id: clientId ? Number(clientId) : null,
      project_id: projectId ? Number(projectId) : null,
      body: body.trim() || null,
      notes: notes.trim() || null,
    };

    if (editingContentId) {
      const { error } = await supabase
        .from("content_items")
        .update(payload)
        .eq("id", editingContentId)
        .eq("user_id", authData.user.id);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from("content_items").insert({
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

  async function deleteContent(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setContentItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function getClientName(clientId: number | null) {
    if (!clientId) return null;
    return clients.find((client) => client.id === clientId)?.name || null;
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
              Content
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              Plan, organize, and manage your content.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm && !editingContentId) {
                resetForm();
                return;
              }

              setShowForm(true);
            }}
            className="whitespace-nowrap rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
          >
            + New Content
          </button>
        </div>

        {showForm && (
          <div className="mx-auto mb-8 max-w-xl rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[#111111]">
                {editingContentId ? "Edit Content" : "New Content"}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Create and organize your next piece of content.
              </p>
            </div>

            <div className="mx-auto max-w-xl space-y-5">
              <div>
                <label className="mb-1.5 block text-base font-medium text-[#111111]">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title"
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                    Content Type
                  </label>

                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
                  >
                    {contentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-base font-medium text-[#111111]">
                    Platform
                  </label>

                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
                  >
                    {platforms.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-base font-medium text-[#111111]">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
                  >
                    {statuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-base font-medium text-[#111111]">
                    Publish Date
                  </label>

                  <input
                    type="datetime-local"
                    value={publishAt}
                    onChange={(e) => setPublishAt(e.target.value)}
                   className="block w-full min-w-0 max-w-full appearance-none rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-base font-medium text-[#111111]">
                    Client
                  </label>

                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
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
                  <label className="mb-1.5 block text-base font-medium text-[#111111]">
                    Project
                  </label>

                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
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

              <div>
                <label className="mb-1.5 block text-base font-medium text-[#111111]">
                  Content
                </label>

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your content here..."
                  rows={8}
                  className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-base font-medium text-[#111111]">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                  rows={4}
                  className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveContent}
                  className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
                >
                  {editingContentId ? "Save Changes" : "Create Content"}
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

        {contentItems.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-base font-semibold text-[#111111]">
              No content yet
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              Create your first content item to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contentItems.map((item) => {
              const clientName = getClientName(item.client_id);
              const projectName = getProjectName(item.project_id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    window.location.href = `/content/${item.id}`;
                  }}
                  className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:bg-[#FCFCFC]"
                >
                  <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1.7fr_1fr_1fr_1.2fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#111111]">
                        {item.title}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                        <span>
                          {contentTypes.find(
                            (type) => type.value === item.content_type
                          )?.label || item.content_type}
                        </span>

                        <span>•</span>

                        <span className="capitalize">
                          {item.platform === "x"
                            ? "X"
                            : item.platform}
                        </span>
                      </div>
                    
{item.notes && (
  <p className="mt-2 truncate text-xs text-[#6B7280]">
    {item.notes}
  </p>
)}

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
    Publish
  </p>
  <p className="mt-1 text-sm text-[#6B7280]">
    {formatDate(item.publish_at)}
  </p>
</div>

                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    startEditing(item);
  }}
  aria-label="Edit content"
  className="rounded-md p-1.5 text-[#9CA3AF] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
>
  <Pencil className="h-4 w-4" />
</button>

<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    deleteContent(item.id);
  }}
  aria-label="Delete content"
 className="rounded-md p-1.5 text-[#9CA3AF] transition hover:text-[#DC2626]"
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