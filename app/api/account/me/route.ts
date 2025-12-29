import { NextResponse } from "next/server";
import { requireSession } from "@/app/lib/requireAuth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        email: true,
        role: true,
        imageUrl: true,
        canRequestLeads: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
