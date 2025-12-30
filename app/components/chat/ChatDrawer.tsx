"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import MessageBubble from "@/app/components/chat/MessageBubble";
import type { ChatMessage, ConversationStatus } from "@/app/components/chat/types";

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  status: ConversationStatus;
  loading: boolean;
  sending: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (message: string) => void | Promise<void>;
  error?: string;
  conversationId?: string | null;
  creatingTicket?: boolean;
  onCreateTicket?: () => void | Promise<void>;
  requireGuestProfile?: boolean;
  guestValues?: { name: string; email: string; phone: string };
  onGuestChange?: (field: "name" | "email" | "phone", value: string) => void;
  onGuestSubmit?: () => void | Promise<void>;
  guestSubmitting?: boolean;
  guestError?: string;
  onRequestHuman?: () => void | Promise<void>;
  requestingHuman?: boolean;
  statusIsHumanRequested?: boolean;
};

const STATUS_STYLES: Record<
  ConversationStatus | "DEFAULT",
  { label: string; dot: string; bg: string; text: string }
> = {
  AI_ONLY: {
    label: "AI Assistant",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-200",
  },
  REQUESTED_HUMAN: {
    label: "Waiting for admin",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/40",
    text: "text-amber-800 dark:text-amber-100",
  },
  HUMAN_ACTIVE: {
    label: "Live chat",
    dot: "bg-sky-500",
    bg: "bg-sky-50 dark:bg-sky-900/40",
    text: "text-sky-800 dark:text-sky-100",
  },
  CLOSED: {
    label: "Closed",
    dot: "bg-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/70",
    text: "text-slate-700 dark:text-slate-200",
  },
  DEFAULT: {
    label: "AI Assistant",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-200",
  },
};

export default function ChatDrawer({
  open,
  onClose,
  messages,
  status,
  loading,
  sending,
  input,
  onInputChange,
  onSend,
  error,
  conversationId,
  creatingTicket,
  onCreateTicket,
  requireGuestProfile = false,
  guestValues,
  onGuestChange,
  onGuestSubmit,
  guestSubmitting = false,
  guestError = "",
  onRequestHuman,
  requestingHuman = false,
  statusIsHumanRequested = false,
}: ChatDrawerProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const statusStyles = useMemo(
    () => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT,
    [status]
  );

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (requireGuestProfile) {
      if (onGuestSubmit) {
        await onGuestSubmit();
      }
      return;
    }
    await onSend(input);
  };

  return (
    <div
      className="fixed inset-0 z-[1250] flex items-end justify-end px-4 pb-20 sm:pb-24"
      aria-modal="true"
      role="dialog"
      aria-label="Support chat"
    >
      <button
        aria-label="Close chat"
        className="absolute inset-0 cursor-default bg-black/10 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        type="button"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-2">
              <span>Support Chat</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles.bg} ${statusStyles.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusStyles.dot}`} />
                {statusStyles.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              {conversationId ? <span>#{conversationId.slice(0, 6)}</span> : null}
              {onRequestHuman ? (
                <button
                  type="button"
                  onClick={onRequestHuman}
                  disabled={requestingHuman || statusIsHumanRequested || requireGuestProfile}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {statusIsHumanRequested ? "Waiting for admin" : requestingHuman ? "Requesting..." : "Request Live Support"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                Close
            </button>
          </div>
        </div>

        {requireGuestProfile ? (
          <div className="space-y-3 bg-white px-4 py-4 text-sm dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Tell us about you to start the chat
            </p>
            <div className="space-y-2">
              <input
                value={guestValues?.name ?? ""}
                onChange={(e) => onGuestChange?.("name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Full name"
                aria-label="Full name"
                required
              />
              <input
                value={guestValues?.email ?? ""}
                onChange={(e) => onGuestChange?.("email", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Email"
                aria-label="Email"
                required
              />
              <input
                value={guestValues?.phone ?? ""}
                onChange={(e) => onGuestChange?.("phone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Phone number"
                aria-label="Phone number"
                required
              />
            </div>
            {guestError ? (
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">{guestError}</div>
            ) : null}
          </div>
        ) : (
          <div
            ref={listRef}
            className="max-h-80 space-y-3 overflow-y-auto bg-white px-4 py-4 text-sm dark:bg-slate-900"
          >
            {loading ? (
              <div className="text-xs text-slate-500 dark:text-slate-400">Loading messages...</div>
            ) : null}
            {!loading && !messages.length ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-500" />
                No messages yet.
              </div>
            ) : null}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {sending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                  Assistant is typing...
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="border-t border-slate-200 bg-white px-4 py-3 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/support/history"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              View full history
            </Link>
            {error ? <span className="text-rose-600 dark:text-rose-400">{error}</span> : null}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800"
        >
          {requireGuestProfile ? (
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Share your contact to start chatting.
              </p>
              <button
                type="submit"
                disabled={guestSubmitting}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 dark:bg-white dark:text-slate-900"
              >
                {guestSubmitting ? "Submitting..." : "Start chat"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                  placeholder="Type a message..."
                  aria-label="Your message"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 dark:bg-white dark:text-slate-900"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
                  Attachment placeholder
                </span>
                {onCreateTicket ? (
                  <button
                    type="button"
                    disabled={!conversationId || creatingTicket}
                    onClick={() => onCreateTicket()}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {creatingTicket ? "Creating..." : "Create ticket"}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
