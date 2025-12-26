import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import fs from "fs/promises";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const safeBaseName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const parsePublishedAt = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.blogPost.findUnique({
    where: { id: params.id }
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim() || "";
  const slugInput = formData.get("slug")?.toString().trim() || "";
  const excerpt = formData.get("excerpt")?.toString().trim() || "";
  const content = formData.get("content")?.toString().trim() || "";
  const tagsInput = formData.get("tags")?.toString() || "";
  const metaTitle = formData.get("metaTitle")?.toString().trim() || null;
  const metaDescription =
    formData.get("metaDescription")?.toString().trim() || null;
  const statusInput = formData.get("status")?.toString() || "DRAFT";
  const publishedAtInput = formData.get("publishedAt")?.toString() || "";
  const coverImage = formData.get("coverImage");

  if (!title || !slugInput || !excerpt || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = normalizeSlug(slugInput);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const slugOwner = await prisma.blogPost.findUnique({ where: { slug } });
  if (slugOwner && slugOwner.id !== existing.id) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const status = statusInput === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const tags = parseTags(tagsInput);
  const publishedAt =
    status === "PUBLISHED"
      ? parsePublishedAt(publishedAtInput) || existing.publishedAt || new Date()
      : null;

  let coverImageUrl = existing.coverImageUrl;
  if (coverImage instanceof File && coverImage.size > 0) {
    if (!coverImage.type.startsWith("image/")) {
      return NextResponse.json({ error: "Cover image must be an image" }, { status: 400 });
    }
    if (coverImage.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Cover image must be under 5MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await coverImage.arrayBuffer());
    const filename = `${Date.now()}-${safeBaseName(coverImage.name)}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "blog");
    await fs.mkdir(uploadDir, { recursive: true });
    const diskPath = path.join(uploadDir, filename);
    await fs.writeFile(diskPath, bytes);
    coverImageUrl = `/uploads/blog/${filename}`;
  }

  await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      title,
      slug,
      excerpt,
      content,
      tags,
      metaTitle,
      metaDescription,
      coverImageUrl,
      status,
      publishedAt
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.blogPost.findUnique({
    where: { id: params.id }
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
