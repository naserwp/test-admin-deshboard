import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

async function resolveParams(
  params: { id: string } | Promise<{ id: string }>
) {
  return Promise.resolve(params);
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await resolveParams(params);
  const job = await prisma.leadJob.findFirst({
    where: { id: jobId, userId: session.user.id },
    include: { results: { orderBy: { createdAt: "desc" } } },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
