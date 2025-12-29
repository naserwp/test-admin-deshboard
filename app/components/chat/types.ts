export type ConversationStatus = "AI_ONLY" | "REQUESTED_HUMAN" | "HUMAN_ACTIVE" | "CLOSED";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "admin" | "system";
  content: string;
  createdAt?: string;
};
