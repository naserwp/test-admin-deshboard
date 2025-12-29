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

async function resolveParams(
  params: { id: string } | Promise<{ id: string }>
) {
  return Promise.resolve(params);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { id } = await resolveParams(params);
  const data: any = {};

  if (body.role === "ADMIN" || body.role === "USER") {
    data.role = body.role;
  }

  if (typeof body.canRequestLeads === "boolean") {
    data.canRequestLeads = body.canRequestLeads;
  }

  if (body.password) {
    const password = String(body.password);
    if (password.length < 6) return NextResponse.json({ error: "password must be at least 6 characters" }, { status: 400 });
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, userId: true, role: true, createdAt: true, email: true, canRequestLeads: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await resolveParams(params);
  // Safety: prevent deleting self
  if ((session.user as any).id === id) {
    return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
