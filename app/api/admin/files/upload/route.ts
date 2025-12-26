import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { storage } from "@/app/lib/storage";
import path from "path";

const allowedMimeTypes = ["application/pdf"];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString() || "";
  const file = formData.get("file") as File | null;

  if (!title || !file) {
    return NextResponse.json({ error: "Missing title or file" }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!allowedMimeTypes.includes(file.type) || extension !== ".pdf") {
    return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storage.saveFile(buffer, file.name);

  await prisma.file.create({
    data: {
      title,
      originalName: file.name,
      storedName: stored.storedName,
      mimeType: file.type,
      size: buffer.length,
      uploadedByAdminId: session.user.id
    }
  });

  return NextResponse.json({ success: true });
}
