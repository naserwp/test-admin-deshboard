import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.isHidden === "boolean") {
    data.isHidden = body.isHidden;
  }
  if (typeof body.isArchived === "boolean") {
    data.isArchived = body.isArchived;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const result = await prisma.leadResult.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!result || result.job.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.leadResult.update({
    where: { id },
    data,
  });

  return NextResponse.json({ result: updated });
}
