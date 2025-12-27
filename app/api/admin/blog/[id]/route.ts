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

const parseCategories = (value: string) =>
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

const estimateSeo = (title: string, metaDescription: string | null, content: string, tags: string[], categories: string[]) => {
  const titleScore = Math.min(40, Math.max(0, title.length / 2));
  const descScore = Math.min(30, Math.max(0, (metaDescription || "").length / 3));
  const headingScore = Math.min(20, content.split("#").length * 3);
  const tagScore = Math.min(10, Math.max(tags.length, categories.length) * 2);
  return Math.min(100, Math.round(titleScore + descScore + headingScore + tagScore));
};

const estimateHuman = (content: string) => {
  const sentences = content.split(".").length;
  const shortLines = content.split("\n").filter((l) => l.length < 120).length;
  return Math.min(100, Math.round((sentences + shortLines) * 2));
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
  const categoriesInput = formData.get("categories")?.toString() || "";
  const metaTitle = formData.get("metaTitle")?.toString().trim() || null;
  const metaDescription =
    formData.get("metaDescription")?.toString().trim() || null;
  const metaImageUrl = formData.get("metaImageUrl")?.toString().trim() || null;
  const videoUrlInput = formData.get("videoUrl")?.toString().trim() || null;
  const customPublished = formData.get("customPublished")?.toString().trim() || null;
  const statusInput = formData.get("status")?.toString() || "DRAFT";
  const publishedAtInput = formData.get("publishedAt")?.toString() || "";
  const seoScoreInput = formData.get("seoScore")?.toString();
  const humanScoreInput = formData.get("humanScore")?.toString();
  const readMinutesOverrideInput = formData.get("readMinutesOverride")?.toString();
  const tocOverride = formData.get("tocOverride")?.toString().trim() || null;
  const coverImage = formData.get("coverImage");
  const coverImageUrlInput = formData.get("coverImageUrl")?.toString().trim() || "";
  const videoFile = formData.get("videoFile");

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
  const categories = parseCategories(categoriesInput);
  const publishedAt =
    status === "PUBLISHED"
      ? parsePublishedAt(publishedAtInput) || existing.publishedAt || new Date()
      : null;
  const seoScore =
    typeof seoScoreInput === "string"
      ? Math.min(100, Math.max(0, parseInt(seoScoreInput, 10) || 0))
      : estimateSeo(title, metaDescription, content, tags, categories);
  const humanScore =
    typeof humanScoreInput === "string"
      ? Math.min(100, Math.max(0, parseInt(humanScoreInput, 10) || 0))
      : estimateHuman(content);
  const readMinutesOverride =
    typeof readMinutesOverrideInput === "string"
      ? Math.max(1, parseInt(readMinutesOverrideInput, 10) || 0)
      : existing.readMinutesOverride;

  let coverImageUrl = coverImageUrlInput || existing.coverImageUrl;
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

  let uploadedVideoUrl: string | null = null;
  if (videoFile instanceof File && videoFile.size > 0) {
    if (!videoFile.type.startsWith("video/")) {
      return NextResponse.json({ error: "Video file must be a video" }, { status: 400 });
    }
    if (videoFile.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Video must be under 20MB" }, { status: 400 });
    }
    const bytes = Buffer.from(await videoFile.arrayBuffer());
    const filename = `${Date.now()}-${safeBaseName(videoFile.name)}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await fs.mkdir(uploadDir, { recursive: true });
    const diskPath = path.join(uploadDir, filename);
    await fs.writeFile(diskPath, bytes);
    uploadedVideoUrl = `/uploads/videos/${filename}`;
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
      metaImageUrl: metaImageUrl || coverImageUrl,
      categories,
      videoUrl: uploadedVideoUrl || videoUrlInput || existing.videoUrl,
      customPublished,
      readMinutesOverride,
      tocOverride,
      seoScore,
      humanScore,
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
