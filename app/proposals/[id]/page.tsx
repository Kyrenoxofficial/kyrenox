"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../utils/client";

type Proposal = {
  id: number;
  title: string;
  client_id: number | null;
  project_id: number | null;
  status: string;
  amount: number | null;
  valid_until: string | null;
  content: string | null;
};

type Client = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
};

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalClientId, setProposalClientId] = useState("");
  const [proposalProjectId, setProposalProjectId] = useState("");
  const [proposalStatus, setProposalStatus] = useState("draft");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalValidUntil, setProposalValidUntil] = useState("");
  const [proposalContent, setProposalContent] = useState("");

  useEffect(() => {
    async function loadProposal() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const proposalId = Number(params.id);

      if (!proposalId) {
        setLoading(false);
        return;
      }

      const [
        { data: proposalData, error: proposalError },
        { data: clientData, error: clientError },
        { data: projectData, error: projectError },
      ] = await Promise.all([
        supabase
          .from("proposals")
          .select(
            "id, title, client_id, project_id, status, amount, valid_until, content"
          )
          .eq("id", proposalId)
          .eq("user_id", user.id)
          .single(),

        supabase
          .from("clients")
          .select("id, name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("projects")
          .select("id, name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (proposalError) {
        console.error(proposalError);
        setLoading(false);
        return;
      }

      if (clientError) {
        console.error(clientError);
      }

      if (projectError) {
        console.error(projectError);
      }

      setProposal(proposalData);
      setClients(clientData ?? []);
      setProjects(projectData ?? []);

      if (proposalData.client_id) {
        const currentClient =
          (clientData ?? []).find(
            (item) => item.id === proposalData.client_id
          ) ?? null;

        setClient(currentClient);
      }

      if (proposalData.project_id) {
        const currentProject =
          (projectData ?? []).find(
            (item) => item.id === proposalData.project_id
          ) ?? null;

        setProject(currentProject);
      }

      setLoading(false);
    }

    loadProposal();
  }, [params.id, router]);

  function startEditing() {
    if (!proposal) {
      return;
    }

    setProposalTitle(proposal.title);
    setProposalClientId(
      proposal.client_id?.toString() ?? ""
    );
    setProposalProjectId(
      proposal.project_id?.toString() ?? ""
    );
    setProposalStatus(proposal.status);
    setProposalAmount(
      proposal.amount !== null
        ? proposal.amount.toString()
        : ""
    );
    setProposalValidUntil(proposal.valid_until ?? "");
    setProposalContent(proposal.content ?? "");

    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function saveProposal() {
    if (!proposal || !proposalTitle.trim()) {
      return;
    }

    const amount = proposalAmount.trim()
      ? Number(proposalAmount)
      : null;

    if (
      proposalAmount.trim() &&
      (Number.isNaN(amount) || amount! < 0)
    ) {
      alert("Please enter a valid amount.");
      return;
    }

    const newClientId = proposalClientId
      ? Number(proposalClientId)
      : null;

    const newProjectId = proposalProjectId
      ? Number(proposalProjectId)
      : null;

    const { error } = await supabase
      .from("proposals")
      .update({
        title: proposalTitle.trim(),
        client_id: newClientId,
        project_id: newProjectId,
        status: proposalStatus,
        amount,
        valid_until: proposalValidUntil || null,
        content: proposalContent.trim() || null,
      })
      .eq("id", proposal.id);

    if (error) {
      alert(error.message);
      return;
    }

    const newClient =
      newClientId !== null
        ? clients.find(
            (item) => item.id === newClientId
          ) ?? null
        : null;

    const newProject =
      newProjectId !== null
        ? projects.find(
            (item) => item.id === newProjectId
          ) ?? null
        : null;

    setProposal({
      ...proposal,
      title: proposalTitle.trim(),
      client_id: newClientId,
      project_id: newProjectId,
      status: proposalStatus,
      amount,
      valid_until: proposalValidUntil || null,
      content: proposalContent.trim() || null,
    });

    setClient(newClient);
    setProject(newProject);
    setEditing(false);
  }

  async function deleteProposal() {
    if (!proposal) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this proposal?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", proposal.id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/proposals");
  }

  function getStatusLabel(status: string) {
    if (status === "sent") {
      return "Sent";
    }

    if (status === "accepted") {
      return "Accepted";
    }

    if (status === "declined") {
      return "Declined";
    }

    return "Draft";
  }

  function getStatusClasses(status: string) {
    if (status === "sent") {
      return "bg-[#DBEAFE] text-[#2563EB]";
    }

    if (status === "accepted") {
      return "bg-[#DCFCE7] text-[#16A34A]";
    }

    if (status === "declined") {
      return "bg-[#FEE2E2] text-[#DC2626]";
    }

    return "bg-[#F3F4F6] text-[#6B7280]";
  }

  function formatAmount(amount: number | null) {
    if (amount === null) {
      return null;
    }

    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }

  function formatValidUntil(dateString: string | null) {
    if (!dateString) {
      return null;
    }

    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <div className="py-10 text-center text-sm text-[#9CA3AF]">
          Loading proposal...
        </div>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-8">
        <a
          href="/proposals"
          className="inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Proposals
        </a>

        <div className="mt-8 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
          <h1 className="text-lg font-medium text-[#111111]">
            Proposal not found
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            This proposal could not be found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="space-y-2">
        

        <a
          href="/proposals"
          className="block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
        >
          ← Back to Proposals
        </a>
      </div>

      {editing ? (
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-[#E5E7EB] bg-white p-6">
          <h1 className="text-lg font-semibold text-[#111111]">
            Edit Proposal
          </h1>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="proposal-title"
                className="block text-sm font-medium text-[#111111]"
              >
                Proposal title
              </label>

              <input
                id="proposal-title"
                type="text"
                value={proposalTitle}
                onChange={(e) =>
                  setProposalTitle(e.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label
                htmlFor="proposal-client"
                className="block text-sm font-medium text-[#111111]"
              >
                Client
              </label>

              <select
                id="proposal-client"
                value={proposalClientId}
                onChange={(e) =>
                  setProposalClientId(e.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
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
              <label
                htmlFor="proposal-project"
                className="block text-sm font-medium text-[#111111]"
              >
                Project
              </label>

              <select
                id="proposal-project"
                value={proposalProjectId}
                onChange={(e) =>
                  setProposalProjectId(e.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="">No project</option>

                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="proposal-status"
                className="block text-sm font-medium text-[#111111]"
              >
                Status
              </label>

              <select
                id="proposal-status"
                value={proposalStatus}
                onChange={(e) =>
                  setProposalStatus(e.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="proposal-amount"
                  className="block text-sm font-medium text-[#111111]"
                >
                  Amount
                </label>

                <input
                  id="proposal-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={proposalAmount}
                  onChange={(e) =>
                    setProposalAmount(e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label
                  htmlFor="proposal-valid-until"
                  className="block text-sm font-medium text-[#111111]"
                >
                  Valid until
                </label>

                <input
                  id="proposal-valid-until"
                  type="date"
                  value={proposalValidUntil}
                  onChange={(e) =>
                    setProposalValidUntil(e.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="proposal-content"
                className="block text-sm font-medium text-[#111111]"
              >
                Content
              </label>

              <textarea
                id="proposal-content"
                value={proposalContent}
                onChange={(e) =>
                  setProposalContent(e.target.value)
                }
                rows={7}
                className="mt-2 w-full resize-none rounded-md border border-[#D1D5DB] px-3 py-3 text-base text-[#111111] outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={saveProposal}
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
            <h1 className="text-2xl font-semibold text-[#111111]">
              {proposal.title}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                proposal.status
              )}`}
            >
              {getStatusLabel(proposal.status)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {client && (
              <a
                href={`/clients/${client.id}`}
                className="inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
              >
                Client: {client.name}
              </a>
            )}

            {project && (
              <a
                href={`/projects/${project.id}`}
                className="inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111111] transition hover:bg-[#F5F5F5]"
              >
                Project: {project.name}
              </a>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-5">
              <p className="text-sm font-medium text-[#111111]">
                Amount
              </p>

              <p className="mt-2 text-lg font-semibold text-[#111111]">
                {formatAmount(proposal.amount) ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-5">
              <p className="text-sm font-medium text-[#111111]">
                Valid until
              </p>

              <p className="mt-2 text-lg font-semibold text-[#111111]">
                {formatValidUntil(proposal.valid_until) ?? "—"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-white px-5 py-5">
            <p className="text-sm font-medium text-[#111111]">
              Proposal content
            </p>

            {proposal.content ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4B5563]">
                {proposal.content}
              </p>
            ) : (
              <p className="mt-3 text-sm text-[#9CA3AF]">
                No proposal content added yet.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              onClick={deleteProposal}
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