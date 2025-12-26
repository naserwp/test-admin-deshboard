import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const schema = z.object({
  fileId: z.string().min(1),
  userIds: z.array(z.string().min(1)).min(1)
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { fileId, userIds } = parse.data;

  await prisma.assignment.createMany({
    data: userIds.map((userId) => ({
      userId,
      fileId,
      status: "LOCKED"
    })),
    skipDuplicates: true
  });

  const assignments = await prisma.assignment.findMany({
    include: {
      user: { select: { id: true, userId: true } },
      file: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ assignments });
}
