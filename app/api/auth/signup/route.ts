import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { rateLimit } from "@/app/lib/rateLimit";

const schema = z.object({
  userId: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().min(8)
});

function getIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const limit = rateLimit(`signup:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }

  const { userId, password } = parse.data;
  const existing = await prisma.user.findUnique({
    where: { userId }
  });
  if (existing) {
    return NextResponse.json(
      { error: "User ID already taken" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      userId,
      passwordHash,
      role: "USER"
    }
  });

  return NextResponse.json({ success: true });
}
