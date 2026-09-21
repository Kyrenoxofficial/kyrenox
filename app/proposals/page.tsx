"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "../utils/client";

type Proposal = {
  id: number;
  title: string;
  client_id: number | null;
  project_id: number | null;
  status: string;
  amount: number | null;
  valid_until: string | null;
  content: string | null;
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

export default function ProposalsPage() {
  const supabase = createClient();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProposalId, setEditingProposalId] =
    useState<number | null>(null);

  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalClientId, setProposalClientId] = useState("");
  const [proposalProjectId, setProposalProjectId] = useState("");
  const [proposalStatus, setProposalStatus] = useState("draft");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalValidUntil, setProposalValidUntil] = useState("");
  const [proposalContent, setProposalContent] = useState("");

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
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
            "id, title, client_id, project_id, status, amount, valid_until, content, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

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
      }

      if (clientError) {
        console.error(clientError);
      }

      if (projectError) {
        console.error(projectError);
      }

      setProposals(proposalData ?? []);
      setClients(clientData ?? []);
      setProjects(projectData ?? []);
      setLoading(false);
    }

    loadData();
  }, []);

  function openNewProposal() {
    setEditingProposalId(null);
    setProposalTitle("");
    setProposalClientId("");
    setProposalProjectId("");
    setProposalStatus("draft");
    setProposalAmount("");
    setProposalValidUntil("");
    setProposalContent("");
    setShowForm(true);
  }

  function closeForm() {
    setEditingProposalId(null);
    setProposalTitle("");
    setProposalClientId("");
    setProposalProjectId("");
    setProposalStatus("draft");
    setProposalAmount("");
    setProposalValidUntil("");
    setProposalContent("");
    setShowForm(false);
  }

  function editProposal(proposal: Proposal) {
    setEditingProposalId(proposal.id);
    setProposalTitle(proposal.title);
    setProposalClientId(proposal.client_id?.toString() ?? "");
    setProposalProjectId(proposal.project_id?.toString() ?? "");
    setProposalStatus(proposal.status);
    setProposalAmount(
      proposal.amount !== null ? proposal.amount.toString() : ""
    );
    setProposalValidUntil(proposal.valid_until ?? "");
    setProposalContent(proposal.content ?? "");
    setShowForm(true);
  }

  async function saveProposal() {
    if (!proposalTitle.trim()) {
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

    if (editingProposalId) {
      const { error } = await supabase
        .from("proposals")
        .update({
          title: proposalTitle.trim(),
          client_id: proposalClientId
            ? Number(proposalClientId)
            : null,
          project_id: proposalProjectId
            ? Number(proposalProjectId)
            : null,
          status: proposalStatus,
          amount,
          valid_until: proposalValidUntil || null,
          content: proposalContent.trim() || null,
        })
        .eq("id", editingProposalId);

      if (error) {
        alert(error.message);
        return;
      }

      setProposals((currentProposals) =>
        currentProposals.map((proposal) =>
          proposal.id === editingProposalId
            ? {
                ...proposal,
                title: proposalTitle.trim(),
                client_id: proposalClientId
                  ? Number(proposalClientId)
                  : null,
                project_id: proposalProjectId
                  ? Number(proposalProjectId)
                  : null,
                status: proposalStatus,
                amount,
                valid_until:
                  proposalValidUntil || null,
                content:
                  proposalContent.trim() || null,
              }
            : proposal
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
        .from("proposals")
        .insert({
          user_id: user.id,
          title: proposalTitle.trim(),
          client_id: proposalClientId
            ? Number(proposalClientId)
            : null,
          project_id: proposalProjectId
            ? Number(proposalProjectId)
            : null,
          status: proposalStatus,
          amount,
          valid_until: proposalValidUntil || null,
          content: proposalContent.trim() || null,
        })
        .select(
          "id, title, client_id, project_id, status, amount, valid_until, content, created_at"
        )
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setProposals((currentProposals) => [
          data,
          ...currentProposals,
        ]);
      }
    }

    closeForm();
  }

  async function deleteProposal(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this proposal?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setProposals((currentProposals) =>
      currentProposals.filter(
        (proposal) => proposal.id !== id
      )
    );
  }

  function getClientName(clientId: number | null) {
    if (!clientId) {
      return null;
    }

    return clients.find(
      (client) => client.id === clientId
    )?.name;
  }

  function getProjectName(projectId: number | null) {
    if (!projectId) {
      return null;
    }

    return projects.find(
      (project) => project.id === projectId
    )?.name;
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

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-8">
      <a
        href="/dashboard"
        className="mb-6 inline-block text-sm text-[#9CA3AF] transition hover:text-[#111111]"
      >
        ← Back to Dashboard
      </a>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">
            Proposals
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Create, manage and track your proposals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="whitespace-nowrap rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
        >
          + New Proposal
        </button>
      </div>

      {showForm && (
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#111111]">
            {editingProposalId
              ? "Edit Proposal"
              : "New Proposal"}
          </h2>

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
                placeholder="e.g. Website redesign proposal"
                className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
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

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
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

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
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
                  placeholder="0.00"
                  className="mt-2 h-11 w-full rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
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
                  className="mt-2 block w-full min-w-0 max-w-full appearance-none rounded-md border border-[#D1D5DB] px-3 text-base text-[#111111] outline-none focus:border-[#111111]"
                  style={{ minWidth: 0 }}
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
                placeholder="Write the proposal details here..."
                rows={6}
                className="mt-2 w-full resize-none rounded-md border border-[#D1D5DB] px-3 py-3 text-base text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={saveProposal}
              className="rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222]"
            >
              {editingProposalId
                ? "Save Changes"
                : "Add Proposal"}
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

      <div className="mt-8">
        {loading ? (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">
            Loading proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-white px-6 py-10 text-center">
            <h2 className="text-lg font-medium text-[#111111]">
              No proposals yet
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Create your first proposal to start managing
              your sales process.
            </p>

           
          </div>
        ) : (
          <div className="w-full space-y-3">
            {proposals.map((proposal) => {
              const clientName = getClientName(
                proposal.client_id
              );
              const projectName = getProjectName(
                proposal.project_id
              );

              return (
                <div
                  key={proposal.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => {
                    window.location.href = `/proposals/${proposal.id}`;
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      e.preventDefault();
                      window.location.href = `/proposals/${proposal.id}`;
                    }
                  }}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm transition hover:border-[#D1D5DB] hover:bg-[#FCFCFC]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="truncate text-sm font-medium text-[#111111] md:text-base">
                        {proposal.title}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          proposal.status
                        )}`}
                      >
                        {getStatusLabel(proposal.status)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9CA3AF]">
                      {clientName && (
                        <span>
                          Client: {clientName}
                        </span>
                      )}

                      {projectName && (
                        <span>
                          Project: {projectName}
                        </span>
                      )}

                      {proposal.amount !== null && (
                        <span>
                          {formatAmount(proposal.amount)}
                        </span>
                      )}

                      {proposal.valid_until && (
                        <span>
                          Valid until{" "}
                          {formatValidUntil(
                            proposal.valid_until
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        editProposal(proposal);
                      }}
                      className="text-[#9CA3AF] transition hover:text-[#111111]"
                      aria-label="Edit proposal"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProposal(proposal.id);
                      }}
                      className="text-[#9CA3AF] transition hover:text-red-500"
                      aria-label="Delete proposal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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