"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "../utils/client";
export default function ClientsPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [clientName, setClientName] = useState("");
const [clientEmail, setClientEmail] = useState("");
const formRef = useRef<HTMLDivElement>(null);
    const [clients, setClients] = useState<
  { id: number; name: string; email: string | null }[]
>([]);

const [projects, setProjects] = useState<
  { id: number; name: string; client_id: number | null }[]
>([]);

    const supabase = createClient();
    useEffect(() => {
  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data } = await supabase
      .from("clients")
      .select("id, name, email")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setClients(data);
    }
  }

  loadClients();
}, []);

useEffect(() => {
  async function loadProjects() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, client_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setProjects(data);
    }
  }

  loadProjects();
}, []);

    async function addClient() {
  const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
  const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');

  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();

  if (!name) {
    alert("Please enter a client name.");
   
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data, error } = await supabase
  .from("clients")
  .insert({
    user_id: user.id,
    name,
    email: email || null,
  })
  .select()
  .single();

  if (error) {
    alert(error.message);
    return;
  }

if (data) {
  setClients((currentClients) => [...currentClients, data]);
}

  setShowForm(false);
}
async function deleteClient(id: number) {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  setClients((currentClients) =>
    currentClients.filter((client) => client.id !== id)
  );
}
async function saveClient() {
  if (!editingClientId || !clientName.trim()) {
    return;
  }

  const { error } = await supabase
    .from("clients")
    .update({
      name: clientName.trim(),
      email: clientEmail.trim() || null,
    })
    .eq("id", editingClientId);

  if (error) {
    alert(error.message);
    return;
  }

  setClients((currentClients) =>
    currentClients.map((client) =>
      client.id === editingClientId
        ? {
            ...client,
            name: clientName.trim(),
            email: clientEmail.trim() || null,
          }
        : client
    )
  );

  setEditingClientId(null);
  setClientName("");
  setClientEmail("");
  setShowForm(false);
}
function editClient(id: number) {
  const client = clients.find((client) => client.id === id);

  if (!client) {
    return;
  }

  setEditingClientId(id);
  setClientName(client.name);
  setClientEmail(client.email ?? "");
  setShowForm(true);

  setTimeout(() => {
  formRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}, 0);


  
}
  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
        <a
  href="/dashboard"
  className="mb-6 inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
>
  ← Back to Dashboard
</a>
      <div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-semibold text-[#111111]">Clients</h1>
    <p className="mt-2 text-sm text-[#6B7280]">
      Manage your clients in one place.
    </p>
  </div>

  <button
  type="button"
  onClick={() => setShowForm(true)}
  className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
>
  + New Client
</button>
</div>
   {showForm && (
  <div
    ref={formRef}
    className="mt-8 max-w-xl mx-auto rounded-lg border border-[#E5E7EB] bg-white p-6"
  >
    <h2 className="text-lg font-semibold text-[#111111]">
      New Client
    </h2>

    <div className="mt-5 space-y-4">
      <input
        type="text"
        placeholder="Client name"
        name="name"
        value={clientName}
onChange={(e) => setClientName(e.target.value)}
        className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
      />

      <input
        type="email"
        placeholder="Email"
        name="email"
        value={clientEmail}
onChange={(e) => setClientEmail(e.target.value)}
        className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
      />

     <div className="flex gap-2"></div>
      <button
  type="button"
  onClick={editingClientId ? saveClient : addClient}
  className="mr-3 rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#222222]"
>
  {editingClientId ? "Save Changes" : "Add Client"}
</button>

<button
  type="button"
  onClick={() => {
    setShowForm(false);
    setEditingClientId(null);
    setClientName("");
    setClientEmail("");
  }}
  className="rounded-md border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#F8F9FA]"
>
  Cancel
</button>

    </div>
  </div>
)} {clients.length > 0 && (
  <div className="mt-8 w-full space-y-3">
    {clients.map((client) => (
      <div
  key={client.id}
  role="link"
  tabIndex={0}
  onClick={() => {
    window.location.href = `/clients/${client.id}`;
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = `/clients/${client.id}`;
    }
  }}
  className="grid cursor-pointer grid-cols-1 gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC] sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-center"
>
        <div className="min-w-0">
  <p className="truncate text-sm font-medium text-[#111111]">
  {client.name}
</p>
</div>

<div className="min-w-0">
  {client.email && (
    <p className="truncate text-sm text-[#9CA3AF]">
      {client.email}
    </p>
  )}
</div>

<div className="min-w-0">
  {projects.filter((project) => project.client_id === client.id).length > 0 && (
    <p className="truncate text-sm text-[#6B7280]">
      Projects:{" "}
      {projects
        .filter((project) => project.client_id === client.id)
        .map((project) => project.name)
        .join(", ")}
    </p>
  )}
</div>

<div className="flex items-center justify-end gap-3">
      <button
  type="button"
 onClick={(e) => {
  e.stopPropagation();
  editClient(client.id);
}}
  className="text-[#9CA3AF] transition hover:text-[#111111]"
  aria-label="Edit client"
>
  <Pencil className="h-4 w-4" />
</button>

      <button
  type="button"
 onClick={(e) => {
  e.stopPropagation();
  deleteClient(client.id);
}}
  className="text-[#9CA3AF] transition hover:text-red-500"
  aria-label="Delete client"
>
  <Trash2 className="h-4 w-4" />
</button></div>
</div>
    ))}
  </div>
)}
</main>
  );
}