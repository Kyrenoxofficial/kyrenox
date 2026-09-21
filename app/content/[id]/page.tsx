"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../utils/client";

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
  return (
    statuses.find((item) => item.value === status)?.label ?? status
  );
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

function getContentTypeLabel(type: string) {
  return (
    contentTypes.find((item) => item.value === type)?.label ?? type
  );
}

function getPlatformLabel(platform: string) {
  return platforms.find((item) => item.value === platform)?.label ?? platform;
}

function formatDate(date: string | null) {
  if (!date) return "No publish date";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("post");
  const [platform, setPlatform] = useState("x");
  const [status, setStatus] = useState("draft");
  const [publishAt, setPublishAt] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setLoading(false);
      return;
    }

    const { data: contentData, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("id", Number(params.id))
      .eq("user_id", authData.user.id)
      .single();

    if (error || !contentData) {
      setLoading(false);
      return;
    }

    const [{ data: clientsData }, { data: projectsData }] =
      await Promise.all([
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

    const foundClient =
      clientsData?.find(
        (item) => item.id === contentData.client_id
      ) || null;

    const foundProject =
      projectsData?.find(
        (item) => item.id === contentData.project_id
      ) || null;

    setContent(contentData);
    setClients(clientsData || []);
    setProjects(projectsData || []);
    setClient(foundClient);
    setProject(foundProject);

    setTitle(contentData.title);
    setContentType(contentData.content_type);
    setPlatform(contentData.platform);
    setStatus(contentData.status);
    setPublishAt(
      contentData.publish_at
        ? new Date(contentData.publish_at)
            .toISOString()
            .slice(0, 16)
        : ""
    );
    setClientId(
      contentData.client_id
        ? String(contentData.client_id)
        : ""
    );
    setProjectId(
      contentData.project_id
        ? String(contentData.project_id)
        : ""
    );
    setBody(contentData.body || "");
    setNotes(contentData.notes || "");

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
    if (!content) {
      return;
    }

    setTitle(content.title);
    setContentType(content.content_type);
    setPlatform(content.platform);
    setStatus(content.status);
    setPublishAt(
      content.publish_at
        ? new Date(content.publish_at).toISOString().slice(0, 16)
        : ""
    );
    setClientId(
      content.client_id ? String(content.client_id) : ""
    );
    setProjectId(
      content.project_id ? String(content.project_id) : ""
    );
    setBody(content.body || "");
    setNotes(content.notes || "");

    setEditing(false);
  }

  async function saveChanges() {
    if (!content) {
      return;
    }

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

    const { error } = await supabase
      .from("content_items")
      .update(payload)
      .eq("id", content.id)
      .eq("user_id", authData.user.id);

    if (error) {
      console.error(error);
      return;
    }

    await loadContent();
    setEditing(false);
  }

  async function deleteContent() {
    if (!content) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", content.id);

    if (error) {
      console.error(error);
      return;
    }

    window.location.href = "/content";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
        <div className="text-sm text-[#6B7280]">Loading...</div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
        <a
          href="/content"
          className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Content
        </a>

        <div className="mt-10 rounded-lg border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
          <h1 className="text-base font-semibold text-[#111111]">
            Content not found
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            This content item could not be found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <a
          href="/content"
          className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Content
        </a>

        {!editing ? (
          <>
            <div className="mb-8 mt-8 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
                    {content.title}
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                      content.status
                    )}`}
                  >
                    {getStatusLabel(content.status)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#6B7280]">
                  {getContentTypeLabel(content.content_type)} ·{" "}
                  {getPlatformLabel(content.platform)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="flex shrink-0 items-center gap-3">
 
</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {client ? (
  <a
    href={`/clients/${client.id}`}
    className="block rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:bg-[#FCFCFC]"
  >
    <p className="text-xs text-[#6B7280]">Client</p>

    <p className="mt-2 text-sm font-medium text-[#111111]">
      {client.name}
    </p>
  </a>
) : (
  <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
    <p className="text-xs text-[#6B7280]">Client</p>

    <p className="mt-2 text-sm text-[#9CA3AF]">
      No client
    </p>
  </div>
)}

              {project ? (
  <a
    href={`/projects/${project.id}`}
    className="block rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:bg-[#FCFCFC]"
  >
    <p className="text-xs text-[#6B7280]">Project</p>

    <p className="mt-2 text-sm font-medium text-[#111111]">
      {project.name}
    </p>
  </a>
) : (
  <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
    <p className="text-xs text-[#6B7280]">Project</p>

    <p className="mt-2 text-sm text-[#9CA3AF]">
      No project
    </p>
  </div>
)}

              <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <p className="text-xs text-[#6B7280]">Publish</p>

                <p className="mt-2 text-sm font-medium text-[#111111]">
                  {formatDate(content.publish_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111111]">
                Content
              </h2>

              {content.body ? (
                <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#111111]">
                  {content.body}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#9CA3AF]">
                  No content added yet.
                </p>
              )}
            </div>

            {content.notes && (
              <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-[#111111]">
                  Notes
                </h2>

                <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6B7280]">
                  {content.notes}
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
    onClick={deleteContent}
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
                Edit Content
              </h1>

              <p className="mt-1 text-sm text-[#6B7280]">
                Update your content details.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
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
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                  >
                    {contentTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                    Platform
                  </label>

                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                    Publish Date
                  </label>

                  <input
                    type="datetime-local"
                    value={publishAt}
                    onChange={(e) => setPublishAt(e.target.value)}
                    className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                  />
                </div>
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Content
                </label>

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm leading-6 text-[#111111] outline-none transition focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111111]">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm leading-6 text-[#111111] outline-none transition focus:border-[#111111]"
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
      </div>
    </main>
  );
}