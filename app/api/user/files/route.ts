import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignments = await prisma.assignment.findMany({
    where: { userId: session.user.id },
    include: { file: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    files: assignments.map((assignment) => ({
      id: assignment.file.id,
      title: assignment.file.title,
      originalName: assignment.file.originalName,
      status: assignment.status
    }))
  });
}
