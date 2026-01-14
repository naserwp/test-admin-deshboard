import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let status = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    status = String(body?.status || "").trim();
  } else {
    const formData = await request.formData();
    status = String(formData.get("status") || "").trim();
  }

  const normalizedStatus = status.toUpperCase();
  if (!["NEW", "IN_PROGRESS", "COMPLETED", "CLOSED"].includes(normalizedStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.businessDocumentRequest.update({
    where: { id },
    data: { status: normalizedStatus as any },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
