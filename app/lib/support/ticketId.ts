import { prisma } from "@/app/lib/prisma";

// Generate a 5-digit numeric ticket id and ensure it is unique.
export async function generateSupportTicketId(): Promise<string> {
  let attempts = 0;
  while (attempts < 5) {
    const candidate = String(Math.floor(10000 + Math.random() * 90000));
    const exists = await prisma.supportTicket.findUnique({
      where: { id: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    attempts += 1;
  }
  throw new Error("Unable to generate ticket id");
}
