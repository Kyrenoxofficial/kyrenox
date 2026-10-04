"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Zap,
  X,
} from "lucide-react";
import { createClient } from "../utils/client";
import MobileSidebar from "../MobileSidebar";
import UnreadMessageBadge from "../UnreadMessageBadge";


type Client = {
  id: number;
  name: string;
  email: string | null;
};

type Project = {
  id: number;
  name: string;
};

type Message = {
  id: number;
  client_id: number;
  project_id: number | null;
  direction: "incoming" | "outgoing";
  content: string;
  status: "received" | "draft" | "sent" | "failed";
  created_at: string;
    read_at: string | null;
  clients?: Client | null;
  projects?: Project | null;
};

type Conversation = {
  client: Client;
  messages: Message[];
  latestMessage: Message | null;
};

export default function MessagesPage() {
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
const [clientSearch, setClientSearch] = useState("");
const [newClientName, setNewClientName] = useState("");
const [newClientEmail, setNewClientEmail] = useState("");
const [creatingClient, setCreatingClient] = useState(false);
const [clientCreateError, setClientCreateError] = useState("");

  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    null
  );

 const [draft, setDraft] = useState("");
const [draftProjectId, setDraftProjectId] = useState("");
const [savingDraft, setSavingDraft] = useState(false);

const [editingMessageId, setEditingMessageId] = useState<number | null>(
  null
);
const [editingContent, setEditingContent] = useState("");


const [reviewingMessageId, setReviewingMessageId] = useState<number | null>(
  null
);


const [messageActionLoading, setMessageActionLoading] = useState<number | null>(
  null
);

const [generatingReply, setGeneratingReply] = useState(false);
const [aiError, setAiError] = useState("");

const [loading, setLoading] = useState(true);
const [savingError, setSavingError] = useState("");
const [loadError, setLoadError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const draftTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoadError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      try {
        const [messagesResponse, clientsResponse, projectsResponse] =
          await Promise.all([
            fetch("/api/messages"),
            supabase
              .from("clients")
              .select("id, name, email")
              .eq("user_id", user.id)
              .order("name", { ascending: true }),
            supabase
              .from("projects")
              .select("id, name")
              .eq("user_id", user.id)
              .order("name", { ascending: true }),
          ]);

        if (!messagesResponse.ok) {
          throw new Error("Could not load messages.");
        }

        const messagesData = await messagesResponse.json();

        if (clientsResponse.error) {
          throw clientsResponse.error;
        }

        if (projectsResponse.error) {
          throw projectsResponse.error;
        }

        const loadedMessages = messagesData.messages ?? [];
        const loadedClients = clientsResponse.data ?? [];
        const loadedProjects = projectsResponse.data ?? [];

        setMessages(loadedMessages);
        setClients(loadedClients);
        setProjects(loadedProjects);

       
      } catch (error) {
        console.error("Failed to load communication center:", error);
        setLoadError(
          "We could not load your messages. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);


  useEffect(() => {
  let cancelled = false;
  let channel: ReturnType<typeof supabase.channel> | null = null;

  async function subscribeToMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || cancelled) {
      return;
    }

   channel = supabase
  .channel(`messages-${user.id}`)
  .on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "messages",
    filter: `user_id=eq.${user.id}`,
  },
  async () => {
    const response = await fetch("/api/messages");

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setMessages(data.messages ?? []);
  }
)
.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "messages",
    filter: `user_id=eq.${user.id}`,
  },
  async () => {
    const response = await fetch("/api/messages");

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    setMessages(data.messages ?? []);
  }
)
  .subscribe();
  }

  subscribeToMessages();

  return () => {
    cancelled = true;

    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);


  const conversations = useMemo<Conversation[]>(() => {
    return clients.map((client) => {
      const clientMessages = messages
        .filter((message) => message.client_id === client.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

      return {
        client,
        messages: clientMessages,
        latestMessage: clientMessages[0] ?? null,
      };
    });
  }, [clients, messages]);

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );



const filteredClients = useMemo(() => {
  const query = clientSearch.trim().toLowerCase();

  if (!query) {
    return clients;
  }

  return clients.filter((client) => {
    const name = client.name.toLowerCase();
    const email = client.email?.toLowerCase() ?? "";

    return name.includes(query) || email.includes(query);
  });
}, [clients, clientSearch]);


  const selectedMessages = useMemo(() => {
    if (!selectedClientId) {
      return [];
    }

    return messages
      .filter((message) => message.client_id === selectedClientId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
  }, [messages, selectedClientId]);

  


useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "end",
  });
}, [selectedMessages]);


useEffect(() => {
  if (!editingMessageId) {
    return;
  }

  
}, [editingMessageId]);


useEffect(() => {
  if (!selectedClientId) {
    return;
  }

  async function markSelectedConversationAsRead() {
    const unreadMessageIds = messages
      .filter(
        (message) =>
          message.client_id === selectedClientId &&
          message.direction === "incoming" &&
          message.status === "received" &&
          message.read_at === null
      )
      .map((message) => message.id);

    if (unreadMessageIds.length === 0) {
      return;
    }

    const readAt = new Date().toISOString();

    const { error } = await supabase
      .from("messages")
      .update({ read_at: readAt })
      .in("id", unreadMessageIds);

    if (error) {
      console.error(
        "Failed to mark messages as read:",
        error
      );
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        unreadMessageIds.includes(message.id)
          ? { ...message, read_at: readAt }
          : message
      )
    );
  }

  markSelectedConversationAsRead();
}, [selectedClientId, messages]);


useEffect(() => {
  const textarea = draftTextareaRef.current;

  if (!textarea) {
    return;
  }

  const maxHeight = 120;

  textarea.style.height = "auto";

  const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > maxHeight ? "auto" : "hidden";

  requestAnimationFrame(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "auto",
    block: "end",
  });
});
}, [draft]);


function openNewConversation() {
  setClientSearch("");
  setNewClientName("");
  setNewClientEmail("");
  setClientCreateError("");
  setIsNewConversationOpen(true);
}


async function createNewClient() {
  const name = newClientName.trim();
  const email = newClientEmail.trim();

  if (!name) {
    setClientCreateError("Please enter a client name.");
    return;
  }

  setCreatingClient(true);
  setClientCreateError("");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        name,
        email: email || null,
      })
      .select("id, name, email")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Could not create client.");
    }

    setClients((currentClients) =>
      [...currentClients, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    setSelectedClientId(data.id);
    setIsNewConversationOpen(false);
  } catch (error) {
    console.error("Failed to create client:", error);

    setClientCreateError(
      "The client could not be created. Please try again."
    );
  } finally {
    setCreatingClient(false);
  }
}


  async function saveDraft() {
    if (!selectedClientId || !draft.trim()) {
      return;
    }

    setSavingDraft(true);
    setSavingError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: selectedClientId,
          projectId: draftProjectId ? Number(draftProjectId) : null,
          direction: "outgoing",
          content: draft.trim(),
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save draft.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        data.message,
      ]);

      setDraft("");
      setDraftProjectId("");
    } catch (error) {
      console.error("Failed to save draft:", error);

      setSavingError(
        "The draft could not be saved. Please try again."
      );
    } finally {
      setSavingDraft(false);
    }
  }



  function startEditingMessage(message: Message) {
  setEditingMessageId(message.id);
  setEditingContent(message.content);
}

function cancelEditingMessage() {
  setEditingMessageId(null);
  setEditingContent("");
}

function startReviewingMessage(message: Message) {
  if (message.status !== "draft") {
    return;
  }

  cancelEditingMessage();
  setReviewingMessageId(message.id);
  setSavingError("");
}

function cancelReviewingMessage() {
  setReviewingMessageId(null);
}

async function updateMessage(messageId: number) {
    const content = editingContent.trim();

    if (!content) {
      return;
    }

    setMessageActionLoading(messageId);
    setSavingError("");

    try {
      const response = await fetch("/api/messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: messageId,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update message.");
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId ? data.message : message
        )
      );

      cancelEditingMessage();
    } catch (error) {
      console.error("Failed to update message:", error);

      setSavingError(
        "The message could not be updated. Please try again."
      );
    } finally {
      setMessageActionLoading(null);
    }
  }

  async function deleteMessage(messageId: number) {
    setMessageActionLoading(messageId);
    setSavingError("");

    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete message.");
      }

      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== messageId)
      );

      if (editingMessageId === messageId) {
        cancelEditingMessage();
      }
    } catch (error) {
      console.error("Failed to delete message:", error);

      setSavingError(
        "The message could not be deleted. Please try again."
      );
    } finally {
      setMessageActionLoading(null);
    }
  }


  async function sendMessage(messageId: number) {
  const message = messages.find(
    (currentMessage) => currentMessage.id === messageId
  );

  if (!message || message.status !== "draft") {
    return;
  }

  setMessageActionLoading(messageId);
  setSavingError("");

  try {
    const response = await fetch("/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not send message.");
    }

    if (!data.message) {
      throw new Error("The sent message could not be loaded.");
    }

    setMessages((currentMessages) =>
      currentMessages.map((currentMessage) =>
        currentMessage.id === messageId
          ? data.message
          : currentMessage
      )
    );

    cancelReviewingMessage();
  } catch (error) {
    console.error("Failed to send message:", error);

    setSavingError(
      "The message could not be sent. Please try again."
    );
  } finally {
    setMessageActionLoading(null);
  }
}



  async function generateReply() {
    if (!selectedClientId) {
      return;
    }

    const latestIncomingMessage = [...selectedMessages]
      .reverse()
      .find((message) => message.direction === "incoming");

    if (!latestIncomingMessage) {
      setAiError("There is no incoming client message to reply to.");
      return;
    }

    setGeneratingReply(true);
    setAiError("");

    const project = latestIncomingMessage.project_id
      ? projects.find(
          (item) => item.id === latestIncomingMessage.project_id
        )
      : null;

    const conversationHistory = selectedMessages
  .filter(
    (message) =>
      message.status === "received" || message.status === "sent"
  )
  .filter((message) => message.id !== latestIncomingMessage.id)
  .slice(-10)
  .map((message) => {
    const speaker =
      message.direction === "incoming" ? "Client" : "Freelancer";

    return `${speaker}: ${message.content}`;
  })
  .join("\n\n");

const prompt = `
Write a professional reply to the client's latest message.

Client:
Name: ${selectedClient?.name ?? "Unknown"}
Email: ${selectedClient?.email ?? "Not provided"}

Project:
${project?.name ?? "Not specified"}

Previous conversation:
${conversationHistory || "No previous conversation."}

Latest client message:
${latestIncomingMessage.content}

Write only the reply text.

Use the previous conversation only as context. Respond directly to the latest client message.

Do not invent or assume any facts, pricing, availability, deadlines, deliverables, promises, policies, experience, results, or commitments.

Do not treat drafts as part of the conversation history because drafts have not been sent.

If important information is missing, ask only the most relevant clarifying question instead of guessing.

Keep the reply natural, professional, concise, and appropriate for real client communication.
Avoid generic filler when a more direct response is possible.

Respond in the same language as the client's latest message.
`;

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "message",
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate reply.");
      }

      const generatedReply =
        typeof data.output === "string" ? data.output.trim() : "";

      if (!generatedReply) {
        throw new Error("The AI returned an empty reply.");
      }

      setDraft(generatedReply);

      if (latestIncomingMessage.project_id) {
        setDraftProjectId(
          latestIncomingMessage.project_id.toString()
        );
      }
    } catch (error) {
      console.error("Failed to generate AI reply:", error);

      setAiError(
        "The AI reply could not be generated. Please try again."
      );
    } finally {
      setGeneratingReply(false);
    }
  }


  const reviewingMessage = reviewingMessageId
  ? messages.find((message) => message.id === reviewingMessageId) ?? null
  : null;

const reviewingProject = reviewingMessage?.project_id
  ? projects.find((project) => project.id === reviewingMessage.project_id)
  : null;


  function formatMessageTime(date: string) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function getConversationPreview(conversation: Conversation) {
    if (!conversation.latestMessage) {
      return "No messages yet";
    }

    const preview = conversation.latestMessage.content.replace(/\s+/g, " ");

    if (preview.length <= 55) {
      return preview;
    }

    return `${preview.slice(0, 55)}…`;
  }

  return (
    <main className="h-screen overflow-hidden bg-[#F8F9FA] text-[#111111]">
      <div className="flex h-full">
       {/* Desktop sidebar */}
<aside className="hidden h-screen w-64 shrink-0 border-r border-[#E5E7EB] bg-white md:flex md:flex-col">
  <div className="flex h-20 items-center border-b border-[#E5E7EB] px-6">
    <div className="flex items-center gap-2">
      <img
        src="/kyrenox-logo.svg"
        alt=""
        className="h-7 w-7"
      />

      <span className="text-xl font-medium tracking-tight">
        Kyrenox
      </span>
    </div>
  </div>

  <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-8">
    <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
      Workspace
    </p>

    <div className="space-y-1">
      <a
        href="/dashboard"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </a>

      <a
        href="/clients"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <Users className="h-4 w-4" />
        Clients
      </a>

      <a
        href="/projects"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <FolderKanban className="h-4 w-4" />
        Projects
      </a>

      <a
        href="/proposals"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <FileText className="h-4 w-4" />
        Proposals
      </a>

      <a
        href="/content"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <FileText className="h-4 w-4" />
        Content
      </a>

      <a
        href="/automations"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <Zap className="h-4 w-4" />
        Automations
      </a>

      <a
        href="/analytics"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </a>

      <a
        href="/activity"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <Activity className="h-4 w-4" />
        Activity
      </a>
    </div>

    <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
      Communication
    </p>

    <div className="space-y-1">
      <a
  href="/messages"
  className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm font-medium text-[#111111]"
>
  <MessageSquare className="h-4 w-4" />
  <span>Messages</span>
  <UnreadMessageBadge />
</a>
    </div>

    <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
      Tools
    </p>

    <div className="space-y-1">
      <a
        href="/ai-workspace"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
      >
        <Sparkles className="h-4 w-4" />
        AI Workspace
      </a>
    </div>
  </nav>

  <div className="shrink-0 border-t border-[#E5E7EB] bg-white p-4">
  <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
    Help & Support
  </p>

  <div className="space-y-1">
    <a
      href="/help"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
    >
      <BookOpen className="h-4 w-4" />
      Help Center
    </a>

    <a
      href="/help/support"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
    >
      <MessageSquare className="h-4 w-4" />
      Contact Support
    </a>
  </div>

  <div className="mt-3 border-t border-[#E5E7EB] pt-3">
    <a
      href="/settings"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
    >
      <Settings className="h-4 w-4" />
      Settings
    </a>

    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#6B7280] transition hover:bg-[#F8F9FA] hover:text-[#111111]"
    >
      Log out
    </button>
  </div>
</div>
</aside>

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
  <div className="md:hidden">
    <MobileSidebar />
  </div>

  <div>
    <p className="text-sm text-[#6B7280]">Communication</p>
    <h1 className="text-lg font-semibold">Messages</h1>
  </div>
</header>

          <div className="flex min-h-0 flex-1 p-4 md:p-6">
            <div className="flex h-[calc(100dvh-6rem)] min-h-0 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:h-[calc(100vh-9.5rem)]">
              {/* Conversations */}
              <aside
  className={`h-full w-full shrink-0 overflow-y-auto border-r border-[#E5E7EB] md:w-80 ${
    selectedClientId ? "hidden md:block" : "block"
  }`}
>
                <div className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white px-5 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold">
                        Inbox
                      </h2>
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        Client communication
                      </p>
                    </div>

                    <button
  type="button"
  onClick={openNewConversation}
  className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#6B7280] transition hover:border-[#D1D5DB] hover:text-[#111111]"
>
  <Plus className="h-3.5 w-3.5" />
  New
</button>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-lg border border-[#F1F1F1] p-3"
                      >
                        <div className="h-4 w-32 rounded bg-[#F1F1F1]" />
                        <div className="mt-2 h-3 w-48 rounded bg-[#F5F5F5]" />
                      </div>
                    ))}
                  </div>
                ) : loadError ? (
                  <div className="p-5">
                    <p className="text-sm text-red-600">{loadError}</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                    <p className="mt-3 text-sm font-medium">
                      No clients yet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#9CA3AF]">
                      Add a client to start building your communication
                      history.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F1F1]">
                    {conversations.map((conversation) => {
  const active =
    conversation.client.id === selectedClientId;

  const hasUnread = conversation.messages.some(
    (message) =>
      message.direction === "incoming" &&
      message.status === "received" &&
      message.read_at === null
  );

  return (
                        <button
                          key={conversation.client.id}
                          type="button"
                          onClick={() =>
                            setSelectedClientId(conversation.client.id)
                          }
                          className={`w-full px-5 py-4 text-left transition ${
                            active
                              ? "bg-[#F8F9FA]"
                              : "hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2">
  <p className="truncate text-sm font-medium">
    {conversation.client.name}
  </p>

  
</div>

                              <p className="mt-1 truncate text-xs text-[#6B7280]">
                                {getConversationPreview(conversation)}
                              </p>
                            </div>

                            {conversation.latestMessage && (
  <div className="flex shrink-0 items-center gap-2">
    {hasUnread && (
      <span
        className="h-2 w-2 rounded-full bg-[#2563EB]"
        aria-label="Unread message"
      />
    )}

    <span className="text-[11px] text-[#9CA3AF]">
      {new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }).format(
        new Date(
          conversation.latestMessage.created_at
        )
      )}
    </span>
  </div>
)}
                          </div>
                        </button>
                      );
                    })}

                
                  </div>
                )}
              </aside>


{isNewConversationOpen && (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 p-4 pt-6 md:items-center md:pt-4">
    <div className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#111111]">
            New Conversation
          </h2>

          <p className="mt-1 text-xs text-[#9CA3AF]">
            Start a conversation with an existing or new client.
          </p>
        </div>

        <button
  type="button"
  onClick={() => setIsNewConversationOpen(false)}
  className="flex h-9 w-9 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#111111]"
  aria-label="Close"
>
  <X className="h-5 w-5" />
</button>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label className="text-xs font-medium text-[#6B7280]">
            Search clients
          </label>

          <input
            type="text"
            value={clientSearch}
            onChange={(event) =>
              setClientSearch(event.target.value)
            }
            placeholder="Search by name or email..."
            autoFocus
            className="mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2.5 text-base text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
          />
        </div>

        <div className="max-h-56 overflow-y-auto rounded-lg border border-[#E5E7EB]">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  setSelectedClientId(client.id);
                  setIsNewConversationOpen(false);
                }}
                className="w-full border-b border-[#F1F1F1] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#F8F9FA]"
              >
                <p className="text-sm font-medium text-[#111111]">
                  {client.name}
                </p>

                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  {client.email || "No email address"}
                </p>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-[#6B7280]">
                No clients found.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[#E5E7EB] pt-5">
          <p className="text-xs font-medium text-[#6B7280]">
            Create new client
          </p>

          <div className="mt-3 space-y-3">
            <input
              type="text"
              value={newClientName}
              onChange={(event) =>
                setNewClientName(event.target.value)
              }
              placeholder="Client name"
              className="w-full rounded-md border border-[#D1D5DB] px-3 py-2.5 text-base text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
            />

            <input
              type="email"
              value={newClientEmail}
              onChange={(event) =>
                setNewClientEmail(event.target.value)
              }
              placeholder="Email address"
              className="w-full rounded-md border border-[#D1D5DB] px-3 py-2.5 text-base text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
            />

            {clientCreateError && (
              <p className="text-sm text-red-600">
                {clientCreateError}
              </p>
            )}

            <button
              type="button"
              onClick={createNewClient}
              disabled={creatingClient || !newClientName.trim()}
              className="w-full rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingClient
                ? "Creating..."
                : "Create Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


              {/* Conversation */}
              <div
  className={`flex min-h-0 min-w-0 flex-1 flex-col ${
    selectedClientId ? "block" : "hidden md:flex"
  }`}
>
                {!selectedClient ? (
                  <div className="flex flex-1 items-center justify-center p-8 text-center">
                    <div>
                      <MessageSquare className="mx-auto h-10 w-10 text-[#D1D5DB]" />
                      <h2 className="mt-4 text-base font-semibold">
                        Select a conversation
                      </h2>
                      <p className="mt-1 max-w-sm text-sm text-[#9CA3AF]">
                        Choose a client from the inbox to view the
                        conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Conversation header */}
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4 md:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedClientId(null)}
                          className="text-sm text-[#9CA3AF] hover:text-[#111111] md:hidden"
                        >
                          ←
                        </button>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-medium text-[#6B7280]">
                          {selectedClient.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold">
                            {selectedClient.name}
                          </h2>

                          <p className="truncate text-xs text-[#9CA3AF]">
                            {selectedClient.email ||
                              "No email address"}
                          </p>
                        </div>
                      </div>

                      <button
  type="button"
  onClick={() => {
    if (selectedClient) {
      window.location.href = `/clients?edit=${selectedClient.id}`;
    }
  }}
  className="text-[#9CA3AF] transition hover:text-[#111111]"
  aria-label="Edit client"
>
  <Pencil className="h-4 w-4" />
</button>
                    </div>

                    {/* Messages */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
                      {selectedMessages.length === 0 ? (
                        <div className="flex h-full min-h-64 items-center justify-center text-center">
                          <div>
                            <MessageSquare className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                            <p className="mt-3 text-sm font-medium">
                              No messages yet
                            </p>
                            <p className="mt-1 text-xs text-[#9CA3AF]">
                              Your communication history with this
                              client will appear here.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mx-auto max-w-3xl space-y-5">
                          {selectedMessages.map((message) => {
  const outgoing = message.direction === "outgoing";
  const isEditing = editingMessageId === message.id;
  const isLoading = messageActionLoading === message.id;

  const canEdit = message.status === "draft";
  const canDelete =
    message.status === "draft" ||
    message.status === "received" ||
    message.status === "failed";

  return (
    <div
      key={message.id}
      className={`flex ${
        outgoing ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[85%] flex-col md:max-w-[70%] ${
          outgoing ? "items-end" : "items-start"
        }`}
      >
        {isEditing ? (
          <div className="w-full min-w-[280px] max-w-xl">
            <textarea
              value={editingContent}
              onChange={(event) =>
                setEditingContent(event.target.value)
              }
              rows={4}
              autoFocus
              className="w-full resize-none rounded-2xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm leading-6 text-[#111111] outline-none focus:border-[#111111]"
            />

            <div
              className={`mt-2 flex items-center gap-2 ${
                outgoing ? "justify-end" : "justify-start"
              }`}
            >
              <button
                type="button"
                onClick={cancelEditingMessage}
                disabled={isLoading}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-[#6B7280] transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => updateMessage(message.id)}
                disabled={isLoading || !editingContent.trim()}
                className="rounded-md bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                outgoing
                  ? "bg-[#111111] text-white"
                  : "border border-[#E5E7EB] bg-[#F8F9FA] text-[#111111]"
              }`}
            >
              {message.content}
            </div>

            <div
              className={`mt-1.5 flex items-center gap-2 text-[11px] text-[#9CA3AF] ${
                outgoing ? "justify-end" : "justify-start"
              }`}
            >
              <span>
                {formatMessageTime(message.created_at)}
              </span>

              {message.status === "draft" && (
                <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[#6B7280]">
                  Draft
                </span>
              )}

              {message.status === "sent" && (
                <span className="text-[#2563EB]">
                  Sent
                </span>
              )}

              {message.status === "failed" && (
                <span className="text-[#DC2626]">
                  Failed
                </span>
              )}

              {(canEdit || canDelete) && (
                <div className="ml-1 flex items-center gap-2">


{canEdit && (
  <button
    type="button"
    onClick={() => startReviewingMessage(message)}
    disabled={isLoading}
    aria-label="Review draft"
    className="text-[#9CA3AF] transition hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Eye className="h-3.5 w-3.5" />
  </button>
)}


{canEdit && (
  <button
    type="button"
    onClick={() => startEditingMessage(message)}
    disabled={isLoading}
    aria-label="Edit draft"
    className="text-[#9CA3AF] transition hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Pencil className="h-3.5 w-3.5" />
  </button>
)}


                  {canDelete && (
                    <button
  type="button"
  onClick={() => deleteMessage(message.id)}
  disabled={isLoading}
  aria-label="Delete message"
  className="text-[#9CA3AF] transition hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
>
  <Trash2 className="h-3.5 w-3.5" />
</button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
})}

                            <div ref={messagesEndRef} />
                          
                        </div>
                      )}
                    </div>

                    {/* Composer */}
                    <div className="border-t border-[#E5E7EB] bg-white p-3 md:p-5">
                      {(savingError || aiError) && (
  <div className="mb-3 space-y-1">
    {savingError && (
      <p className="text-sm text-red-600">
        {savingError}
      </p>
    )}

    {aiError && (
      <p className="text-sm text-red-600">
        {aiError}
      </p>
    )}
  </div>
)}

                      <div className="mx-auto max-w-3xl">
  {reviewingMessage ? (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#111111]">
            Review Draft
          </p>

          <p className="mt-0.5 text-xs text-[#9CA3AF]">
            Review this message before sending.
          </p>
        </div>

        <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#6B7280]">
          Draft
        </span>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
              Client
            </p>

            <p className="mt-1 text-sm text-[#111111]">
              {selectedClient?.name ?? "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
              Project
            </p>

            <p className="mt-1 text-sm text-[#111111]">
              {reviewingProject?.name ?? "No project"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Message
          </p>

          <div className="mt-2 whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3 text-sm leading-6 text-[#111111]">
            {reviewingMessage.content}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
  <button
    type="button"
    onClick={cancelReviewingMessage}
    disabled={messageActionLoading === reviewingMessage.id}
    className="rounded-md px-3 py-2 text-xs font-medium text-[#6B7280] transition hover:bg-[#F5F5F5] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
  >
    Back to Draft
  </button>

  <button
    type="button"
    onClick={() => sendMessage(reviewingMessage.id)}
    disabled={messageActionLoading === reviewingMessage.id}
    className="flex items-center gap-2 rounded-md bg-[#111111] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Send className="h-3.5 w-3.5" />
    {messageActionLoading === reviewingMessage.id
      ? "Sending..."
      : "Send"}
  </button>
</div>
      </div>
    </div>
  ) : (
    <>
      <textarea
  ref={draftTextareaRef}
  value={draft}
  onChange={(event) =>
    setDraft(event.target.value)
  }
  onKeyDown={(event) => {
    if (event.key === "Enter" && event.shiftKey === false) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }}
  placeholder="Write a message draft..."
  rows={1}
        className="max-h-[120px] w-full resize-none overflow-y-hidden rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-base leading-5 text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111] sm:text-sm"
      />

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <select
            value={draftProjectId}
            onChange={(event) =>
              setDraftProjectId(event.target.value)
            }
            className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#6B7280] outline-none focus:border-[#111111]"
          >
            <option value="">
              No project
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={generateReply}
            disabled={generatingReply || !selectedClientId}
            className="flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#6B7280] transition hover:border-[#D1D5DB] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generatingReply ? "Generating..." : "AI Reply"}
          </button>
        </div>

        <button
          type="button"
          onClick={saveDraft}
          disabled={savingDraft || !draft.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#111111] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" />
          {savingDraft
            ? "Saving..."
            : "Save Draft"}
        </button>
      </div>

      <p className="mt-2 hidden text-[11px] text-[#9CA3AF] sm:block">
        Drafts are saved in Kyrenox. Nothing is sent
        externally yet.
      </p>
    </>
  )}
</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}