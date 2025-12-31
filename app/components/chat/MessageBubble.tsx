"use client";

import type { ChatMessage } from "@/app/components/chat/types";

type MessageBubbleProps = {
  message: ChatMessage;
};

const ROLE_LABEL: Record<ChatMessage["role"], string> = {
  user: "You",
  assistant: "AI Assistant",
  admin: "Admin",
  system: "Assistant",
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAdmin = message.role === "admin";

  const bubbleClasses = [
    "rounded-2xl px-4 py-2 text-sm shadow-sm",
    isUser
      ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-white"
      : isAdmin
      ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-100"
      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  ].join(" ");

  const timestamp =
    message.createdAt && !message.createdAt.startsWith("temp-")
      ? new Date(message.createdAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] space-y-1">
        <div
          className={`text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
            isUser ? "text-right" : ""
          }`}
        >
          {ROLE_LABEL[message.role] ?? "Assistant"}
        </div>
        <div className={bubbleClasses}>{message.content}</div>
        {timestamp ? (
          <div
            className={`text-[10px] uppercase tracking-wide text-slate-400 ${
              isUser ? "text-right" : ""
            }`}
          >
            {timestamp}
          </div>
        ) : null}
      </div>
    </div>
  );
}
