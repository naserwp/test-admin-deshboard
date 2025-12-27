import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import fs from "fs/promises";
import { authOptions } from "@/app/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED = ["image/", "video/"];

const safeBaseName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }
  if (!ALLOWED.some((prefix) => file.type.startsWith(prefix))) {
    return NextResponse.json({ error: "Only images or videos allowed" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeBaseName(file.name)}`;
  const extDir = file.type.startsWith("video/") ? "videos" : "blog";
  const uploadDir = path.join(process.cwd(), "public", "uploads", extDir);
  await fs.mkdir(uploadDir, { recursive: true });
  const diskPath = path.join(uploadDir, filename);
  await fs.writeFile(diskPath, bytes);
  const url = `/uploads/${extDir}/${filename}`;

  return NextResponse.json({ url, type: file.type.startsWith("video/") ? "video" : "image" });
}
