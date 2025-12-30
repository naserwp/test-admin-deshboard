"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatDrawer from "@/app/components/chat/ChatDrawer";
import type { ChatMessage, ConversationStatus } from "@/app/components/chat/types";

const STORAGE_KEY = "vo:conversationId";
const GUEST_PROFILE_KEY = "vo:guestProfile";

const SEED_MESSAGE: ChatMessage = {
  id: "seed-intro",
  role: "assistant",
  content: "Hi! I'm the Virtual Office assistant. How can I help you today?",
};

function mapApiMessage(raw: any): ChatMessage {
  const role = raw.role === "ASSISTANT" || raw.role === "assistant"
    ? "assistant"
    : raw.role === "ADMIN" || raw.role === "admin"
    ? "admin"
    : raw.role === "SYSTEM"
    ? "assistant"
    : "user";

  const fallbackId =
    raw.id ||
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  return {
    id: fallbackId,
    role,
    content: raw.content || "",
    createdAt: raw.createdAt,
  };
}

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();
  existing.forEach((msg) => byId.set(msg.id, msg));
  incoming.forEach((msg) => byId.set(msg.id, msg));
  const merged = Array.from(byId.values());
  merged.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });
  return merged.length ? merged : [SEED_MESSAGE];
}

type GuestProfile = {
  name: string;
  email: string;
  phone: string;
  storedAt: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationStatus>("AI_ONLY");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [guestForm, setGuestForm] = useState({ name: "", email: "", phone: "" });
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [requestingHuman, setRequestingHuman] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const badgeText = useMemo(() => {
    const count = messages.filter((m) => m.role !== "user").length;
    return count > 9 ? "9+" : String(count || 1);
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setConversationId(stored);
    const storedProfile = window.localStorage.getItem(GUEST_PROFILE_KEY);
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.name && parsed?.email && parsed?.phone) {
          setGuestProfile(parsed as GuestProfile);
          setGuestForm({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
          });
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!cancelled) {
          setIsAuthenticated(Boolean(data?.user?.id));
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) setAuthChecked(true);
      }
    };
    fetchSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const needsGuestProfile = authChecked && !isAuthenticated && !guestProfile;

  useEffect(() => {
    if (!open) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }
    if (!needsGuestProfile) {
      void hydrateConversation();
    }
  }, [open, needsGuestProfile]);

  useEffect(() => {
    if (!open || !conversationId || needsGuestProfile) return;

    // SSE realtime
    const url = `/api/chat/events?conversationId=${conversationId}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;
    let fallbackStarted = false;
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message:new" && Array.isArray(data.payload?.messages)) {
          const mapped = data.payload.messages.map(mapApiMessage);
          setMessages((prev) => mergeMessages(prev, mapped));
        }
        if (data.type === "status:update" && data.payload?.status) {
          setStatus(data.payload.status as ConversationStatus);
        }
      } catch {
        // ignore bad events
      }
    };
    es.onerror = () => {
      // fallback to polling
      if (fallbackStarted) return;
      fallbackStarted = true;
      es.close();
      const poll = setInterval(() => {
        void refreshConversation(conversationId, false);
      }, 5000);
      pollRef.current = poll as any;
    };

    return () => {
      es.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, conversationId, needsGuestProfile]);

  const ensureConversation = async () => {
    if (needsGuestProfile) {
      throw new Error("Please share your contact details to start chatting.");
    }
    if (conversationId) return conversationId;
    const payload =
      !isAuthenticated && (guestProfile || guestForm.name || guestForm.email || guestForm.phone)
        ? {
            visitorName: guestProfile?.name ?? guestForm.name,
            visitorEmail: guestProfile?.email ?? guestForm.email,
            visitorPhone: guestProfile?.phone ?? guestForm.phone,
          }
        : null;
    const resStart = await fetch("/api/chat/start", {
      method: "POST",
      ...(payload
        ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
        : {}),
    });
    if (!resStart.ok) throw new Error("Unable to start chat");
    const dataStart = await resStart.json();
    const newId = dataStart.conversation?.id as string;
    const newStatus = (dataStart.conversation?.status as ConversationStatus) || "AI_ONLY";
    setConversationId(newId);
    setStatus(newStatus);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, newId);
    }
    setMessages((prev) => (prev.length ? prev : [SEED_MESSAGE]));
    return newId;
  };

  const refreshConversation = async (targetId: string, showLoading = true) => {
    if (showLoading) setLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/${targetId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.messages || []).map(mapApiMessage);
        setStatus((data.conversation?.status as ConversationStatus) || "AI_ONLY");
        setMessages((prev) => mergeMessages(prev, mapped));
        setError("");
      } else if (res.status === 401 || res.status === 403) {
        setError("Sign in to view your previous messages.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat unavailable");
    } finally {
      if (showLoading) setLoadingHistory(false);
    }
  };

  const hydrateConversation = async () => {
    setError("");
    try {
      const id = await ensureConversation();
      await refreshConversation(id, true);
    } catch (err) {
      setLoadingHistory(false);
      setError(err instanceof Error ? err.message : "Chat unavailable");
    }
  };

  const handleSend = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;
    if (needsGuestProfile) {
      setError("Please share your contact details to start chatting.");
      return;
    }
    setSending(true);
    setError("");
    setInput("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => mergeMessages(prev, [optimisticMessage]));

    try {
      const activeConversationId = await ensureConversation();
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Send failed");
      }
      const data = await res.json();
      const mapped = (data.messages || []).map(mapApiMessage);
      setMessages((prev) => mergeMessages(prev, mapped));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleGuestSubmit = async () => {
    if (guestSubmitting) return;
    setGuestError("");
    const name = guestForm.name.trim();
    const email = guestForm.email.trim();
    const phone = guestForm.phone.trim();

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneDigits = phone.replace(/[^+\d]/g, "");

    if (!name) {
      setGuestError("Name is required");
      return;
    }
    if (!emailValid) {
      setGuestError("Valid email is required");
      return;
    }
    if (phoneDigits.length < 8) {
      setGuestError("Phone number must be at least 8 digits");
      return;
    }

    setGuestSubmitting(true);
    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: name,
          visitorEmail: email,
          visitorPhone: phone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to start chat");
      }
      const data = await res.json();
      const newId = data.conversation?.id as string;
      const newStatus = (data.conversation?.status as ConversationStatus) || "AI_ONLY";

      const storedProfile: GuestProfile = {
        name,
        email,
        phone,
        storedAt: new Date().toISOString(),
      };
      setGuestProfile(storedProfile);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(storedProfile));
      }

      setConversationId(newId);
      setStatus(newStatus);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, newId);
      }
      setMessages((prev) => (prev.length ? prev : [SEED_MESSAGE]));
      setError("");
      setGuestError("");
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : "Unable to start chat");
    } finally {
      setGuestSubmitting(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!conversationId || creatingTicket) return;
    const subject = typeof window !== "undefined" ? window.prompt("Add a subject for this ticket (optional):", "") : "";
    setCreatingTicket(true);
    setError("");
    try {
      const res = await fetch("/api/tickets/from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...(subject ? { subject } : {}) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Ticket create failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ticket create failed");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleRequestHuman = async () => {
    if (requestingHuman || status === "HUMAN_ACTIVE" || status === "REQUESTED_HUMAN") return;
    setRequestingHuman(true);
    setError("");
    try {
      const activeConversationId = await ensureConversation();
      const res = await fetch("/api/chat/request-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to request live support");
      }
      const data = await res.json();
      setStatus((data.conversation?.status as ConversationStatus) || "REQUESTED_HUMAN");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request live support");
    } finally {
      setRequestingHuman(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[1200] inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500"
        aria-label="Open chat"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-inner">
          Chat
        </span>
        <span>Chat</span>
        <span className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-bold dark:bg-slate-700 dark:text-slate-100">
          {badgeText}
        </span>
      </button>

      <ChatDrawer
        open={open}
        onClose={() => setOpen(false)}
        messages={messages.length ? messages : [SEED_MESSAGE]}
        status={status}
        loading={loadingHistory}
        sending={sending}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        error={error}
        conversationId={conversationId}
        creatingTicket={creatingTicket}
        onCreateTicket={handleCreateTicket}
        requireGuestProfile={needsGuestProfile}
        guestValues={guestForm}
        onGuestChange={(field, value) =>
          setGuestForm((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onGuestSubmit={handleGuestSubmit}
        guestSubmitting={guestSubmitting}
        guestError={guestError}
        onRequestHuman={handleRequestHuman}
        requestingHuman={requestingHuman}
        statusIsHumanRequested={status === "REQUESTED_HUMAN" || status === "HUMAN_ACTIVE"}
      />
    </>
  );
}
