"use client";

import { useState } from "react";

type ConversationHeaderActionsProps = {
  conversationId: string;
  initialStatus: string;
};

export default function ConversationHeaderActions({
  conversationId,
  initialStatus,
}: ConversationHeaderActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [closing, setClosing] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const postAction = async (path: string, nextStatus?: string) => {
    setError("");
    setMessage("");
    const res = await fetch(path, { method: "POST" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(payload.error || "Unable to update conversation.");
      return;
    }
    const updatedStatus = payload.conversation?.status || nextStatus;
    if (updatedStatus) setStatus(updatedStatus);
    setMessage(updatedStatus === "CLOSED" ? "Conversation closed." : "Conversation updated.");
  };

  const handleTakeover = async () => {
    if (takingOver) return;
    setTakingOver(true);
    await postAction(`/api/admin/conversations/${conversationId}/takeover`, "HUMAN_ACTIVE");
    setTakingOver(false);
  };

  const handleClose = async () => {
    if (closing) return;
    setClosing(true);
    await postAction(`/api/admin/conversations/${conversationId}/close`, "CLOSED");
    setClosing(false);
  };

  return (
    <div className="flex flex-col items-end gap-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
          {status}
        </span>
        <button
          className="rounded-full bg-slate-900 px-3 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
          type="button"
          onClick={handleTakeover}
          disabled={takingOver}
        >
          {takingOver ? "Taking over..." : "Take Over Live"}
        </button>
        <button
          className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
          type="button"
          onClick={handleClose}
          disabled={closing}
        >
          {closing ? "Closing..." : "Close"}
        </button>
      </div>
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
