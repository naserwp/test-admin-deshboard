import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

function requireAdmin(session: any) {
  if (!session?.user) return { ok: false, status: 401, error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { ok: false, status: 403, error: "Forbidden" };
  return { ok: true as const };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, userId: true, role: true, createdAt: true },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const userId = String(body.userId || "").trim();
  const password = String(body.password || "");
  const role = body.role === "ADMIN" ? "ADMIN" : "USER";

  if (userId.length < 3) return NextResponse.json({ error: "userId must be at least 3 characters" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "password must be at least 6 characters" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { userId } });
  if (exists) return NextResponse.json({ error: "userId already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { userId, passwordHash, role },
    select: { id: true, userId: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
