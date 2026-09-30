"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/client";
import { Pencil, Trash2 } from "lucide-react";

type KnowledgeItem = {
  id: number;
  title: string;
  category: string;
  content: string;
  created_at: string;
};

const categories = [
  "General",
  "Brand",
  "Services",
  "Processes",
  "Clients",
  "Content",
  "Sales",
  "Operations",
];

export default function KnowledgeBasePage() {
  const supabase = createClient();

  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Could not load the knowledge base.");
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setCategory("General");
    setContent("");
    setEditingId(null);
    setError("");
  }

  function startEditing(item: KnowledgeItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveKnowledge() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setError("You must be logged in to save knowledge.");
      return;
    }

    if (editingId !== null) {
      const { data, error } = await supabase
        .from("knowledge_items")
        .update({
          title: title.trim(),
          category: category.trim() || "General",
          content: content.trim(),
        })
        .eq("id", editingId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error || !data) {
        setError("Could not update this knowledge item.");
        setSaving(false);
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === editingId ? data : item))
      );
    } else {
      const { data, error } = await supabase
        .from("knowledge_items")
        .insert({
          user_id: user.id,
          title: title.trim(),
          category: category.trim() || "General",
          content: content.trim(),
        })
        .select()
        .single();

      if (error || !data) {
        setError("Could not add this knowledge item.");
        setSaving(false);
        return;
      }

      setItems((current) => [data, ...current]);
    }

    resetForm();
    setSaving(false);
  }

  async function deleteItem(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this knowledge item?"
    );

    if (!confirmed) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("knowledge_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setError("Could not delete this knowledge item.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-8 md:px-9">
      <div>
        <Link
          href="/ai-workspace"
          className="mb-8 block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to AI Workspace
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Knowledge Base
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Store important business knowledge, processes, services, and
            reusable information for your workflow.
          </p>
        </div>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">
                {editingId !== null ? "Edit Knowledge" : "Add Knowledge"}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                {editingId !== null
                  ? "Update the information stored in your knowledge base."
                  : "Add information you want to keep and reuse."}
              </p>
            </div>

            
          </div>

          <div className="mt-5 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the information you want to keep..."
              rows={7}
              className="w-full resize-y rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base leading-6 text-[#111111] outline-none focus:border-[#111111]"
            />

            {error && (
              <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={saveKnowledge}
                disabled={saving || !title.trim() || !content.trim()}
                className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Knowledge"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#F8F9FA]"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge..."
            className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-10 text-sm text-[#6B7280]">
              Loading knowledge...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-[#111111]">
                No knowledge found
              </p>

              <p className="mt-1 text-sm text-[#6B7280]">
                Add your first knowledge item or adjust your search.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                      {item.category}
                    </p>

                    <h2 className="mt-1 text-base font-semibold text-[#111111]">
                      {item.title}
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B7280]">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
  <button
    type="button"
    onClick={() => startEditing(item)}
    className="text-[#9CA3AF] transition hover:text-[#111111]"
    aria-label="Edit knowledge"
  >
    <Pencil className="h-4 w-4" />
  </button>

  <button
    type="button"
    onClick={() => deleteItem(item.id)}
    className="text-[#9CA3AF] transition hover:text-red-500"
    aria-label="Delete knowledge"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}