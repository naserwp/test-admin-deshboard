import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import fs from "fs/promises";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

function isAdmin(session: any) {
  return session?.user?.role === "ADMIN";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const filename = `${Date.now()}-user.${ext}`;

  const diskPath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
  await fs.writeFile(diskPath, bytes);

  const imageUrl = `/uploads/avatars/${filename}`;

  await prisma.user.update({
    where: { id },
    data: { imageUrl },
  });

  return NextResponse.json({ imageUrl });
}
