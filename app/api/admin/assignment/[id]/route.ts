import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id }
  });

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newStatus = assignment.status === "LOCKED" ? "UNLOCKED" : "LOCKED";
  const updated = await prisma.assignment.update({
    where: { id },
    data: { status: newStatus }
  });

  return NextResponse.json({ status: updated.status });
}
