import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

function requireAdmin(session: any) {
  if (!session?.user) return { ok: false, status: 401, error: "Unauthorized" };
  if (session.user.role !== "ADMIN") {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true as const };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const jobs = await prisma.leadJob.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, userId: true, email: true } } },
  });

  return NextResponse.json({ jobs });
}
