import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import fs from "fs/promises";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

function safeBaseName(name: string) {
  // remove weird unicode/control chars
  return name.normalize("NFKD").replace(/[^\x20-\x7E]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
  }

  // size limit: 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 5MB allowed" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const filename = `${Date.now()}-${safeBaseName((session.user as any).userId || "user")}.${ext}`;

  const diskPath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
  await fs.writeFile(diskPath, bytes);

  const imageUrl = `/uploads/avatars/${filename}`; // public serve প্রয়োজন (নিচে Part D)

  // NOTE: session.user.id আপনার DB User.id হলে এইটা ঠিক।
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { imageUrl },
  });

  return NextResponse.json({ imageUrl });
}
