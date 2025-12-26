import { NextResponse } from "next/server";
import { requireSession } from "@/app/lib/requireAuth";
import { prisma } from "@/app/lib/prisma";
import path from "path";
import fs from "fs/promises";

function isAllowedMime(mime: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(mime);
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const id = (session.user as any).id;

    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!isAllowedMime(file.type))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024)
      return NextResponse.json(
        { error: "File too large (max 2MB)" },
        { status: 400 }
      );

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const filename = `${id}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    const filepath = path.join(uploadDir, filename);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filepath, bytes);

    const imageUrl = `/uploads/avatars/${filename}`;

    await prisma.user.update({
      where: { id },
      data: { imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const session = await requireSession();
    const id = (session.user as any).id;

    // পুরনো ফাইল delete (optional কিন্তু ভালো)
    const user = await prisma.user.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (user?.imageUrl?.startsWith("/uploads/avatars/")) {
      const diskPath = path.join(process.cwd(), "public", user.imageUrl);
      try {
        await fs.unlink(diskPath);
      } catch {}
    }

    await prisma.user.update({
      where: { id },
      data: { imageUrl: null },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
