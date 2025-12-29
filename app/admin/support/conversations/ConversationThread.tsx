"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type Props = {
  conversationId: string;
  initialStatus: string;
  initialMessages: Message[];
};

export default function ConversationThread({
  conversationId,
  initialStatus,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `/api/chat/events?conversationId=${conversationId}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message:new" && Array.isArray(data.payload?.messages)) {
          setMessages((prev) => {
            const byId = new Map<string, Message>();
            [...prev, ...data.payload.messages].forEach((m) => byId.set(m.id, m as Message));
            const merged = Array.from(byId.values());
            merged.sort(
              (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
            );
            return merged;
          });
        }
        if (data.type === "status:update" && data.payload?.status) {
          setStatus(data.payload.status);
        }
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
      const poll = setInterval(async () => {
        const res = await fetch(`/api/admin/conversations/${conversationId}`);
        const data = await res.json();
        if (res.ok) {
          setMessages(data.messages || []);
          setStatus(data.conversation?.status || status);
        }
      }, 5000);
      pollRef.current = poll as any;
    };
    return () => {
      es.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, status]);

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) return;
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const postAction = async (path: string) => {
    await fetch(path, { method: "POST" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold">{status}</span>
        <button
          onClick={() => postAction(`/api/admin/conversations/${conversationId}/takeover`)}
          className="rounded-full bg-slate-900 px-3 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          type="button"
        >
          Take Over Live
        </button>
        <button
          onClick={() => postAction(`/api/admin/conversations/${conversationId}/close`)}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          type="button"
        >
          Close
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
                  {msg.role === "ADMIN"
                    ? "Admin"
                    : msg.role === "ASSISTANT"
                    ? "Assistant"
                    : msg.role === "SYSTEM"
                    ? "System"
                    : "User"}
                </span>
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                {msg.content}
              </div>
            </div>
          ))}
          {!messages.length ? <div className="text-sm text-slate-500">No messages yet.</div> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={sendReply} className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-800">Admin reply</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              rows={3}
              placeholder="Type your reply to the user..."
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
