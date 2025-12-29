import { runOpenAIChat } from "@/app/lib/openai/client";

const SYSTEM_PROMPT = `
You are a helpful website support assistant for a Virtual Office platform.
- Ask clarifying questions when needed.
- Provide concise, actionable answers.
- If the user asks for human help, politely acknowledge and set "human_requested=true".
- Keep responses short (2-4 sentences) unless more detail is needed.
`.trim();

export async function chatWithOpenAI(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  try {
    return await runOpenAIChat([{ role: "system", content: SYSTEM_PROMPT }, ...messages]);
  } catch (error) {
    console.error("OpenAI chat error:", error);
    throw error;
  }
}
