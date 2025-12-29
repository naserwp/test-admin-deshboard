import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.status && !body?.priority) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { id } = await params;

  const data: any = {};
  if (body.status === "OPEN" || body.status === "PENDING" || body.status === "RESOLVED" || body.status === "CLOSED") {
    data.status = body.status;
  }
  if (body.priority === "LOW" || body.priority === "MEDIUM" || body.priority === "HIGH" || body.priority === "URGENT") {
    data.priority = body.priority;
  }

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data,
    select: { id: true, status: true, priority: true, updatedAt: true },
  });

  return NextResponse.json({ ticket });
}
