import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import fs from "fs";
import path from "path";

function firstExisting(paths: string[]) {
  for (const p of paths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ✅ আপনার প্রোজেক্টে ফাইলগুলো "uploads/" ফোল্ডারে আছে (public না)
  const storedName =
    (file as any).storedName ||
    (file as any).fileName ||
    (file as any).name ||
    null;

  const candidates: string[] = [
    (file as any).storagePath,
    (file as any).filePath,
    (file as any).relativePath,
    (file as any).path,
    (file as any).url,
    storedName,
  ].filter(Boolean);

  const baseRoot = process.cwd();
  const baseUploads = path.join(baseRoot, "uploads");
  const basePublic = path.join(baseRoot, "public");

  const guesses: string[] = [];

  for (const c of candidates) {
    const v = String(c);

    // A) if already absolute
    if (path.isAbsolute(v)) guesses.push(v);

    // B) if starts with /uploads/... or uploads/...
    const cleaned = v.replace(/^\/+/, ""); // remove leading "/"
    guesses.push(path.join(baseUploads, cleaned));
    guesses.push(path.join(basePublic, cleaned));

    // C) if just filename => try uploads root
    const isJustName = !v.includes("/") && !v.includes("\\");
    if (isJustName) {
      guesses.push(path.join(baseUploads, v));
      guesses.push(path.join(basePublic, "uploads", v));
      guesses.push(path.join(basePublic, "uploads", "files", v));
      guesses.push(path.join(basePublic, "uploads", "documents", v));
      guesses.push(path.join(basePublic, "uploads", "pdf", v));
    }
  }

  const filePath = firstExisting(guesses);

  if (!filePath) {
    return NextResponse.json(
      {
        error: "File not found on disk",
        hint: "Your files appear to be in /uploads (project root). Check Prisma File fields (storedName/storagePath).",
        fileId: file.id,
        triedSample: guesses.slice(0, 20),
      },
      { status: 404 }
    );
  }

  const stat = fs.statSync(filePath);
  const size = stat.size;

  const range = req.headers.get("range");
  const headers = new Headers();

  headers.set("Content-Type", "application/pdf");
  headers.set(
    "Content-Disposition",
    `inline; filename="${(file as any).originalName || "document.pdf"}"`
  );
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, max-age=0, must-revalidate");

  // ✅ Range support (Chrome PDF viewer often needs this)
  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (!match) {
      return new NextResponse(null, { status: 416 });
    }

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : size - 1;

    if (start >= size || end >= size || start > end) {
      return new NextResponse(null, { status: 416 });
    }

    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));

    const stream = fs.createReadStream(filePath, { start, end });
    return new NextResponse(stream as any, { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  const stream = fs.createReadStream(filePath);
  return new NextResponse(stream as any, { status: 200, headers });
}
