import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await prisma.leadResult.findMany({
    where: { job: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: {
      job: { select: { id: true, keyword: true, createdAt: true } },
    },
  });

  const notifications = results.map((result) => ({
    id: result.id,
    createdAt: result.createdAt,
    businessName: result.businessName,
    email: result.email,
    phone: result.phone,
    city: result.city,
    state: result.state,
    country: result.country,
    jobId: result.jobId,
    keyword: result.job?.keyword ?? "Lead job",
  }));

  return NextResponse.json({ notifications });
}
