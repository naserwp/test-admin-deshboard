import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function applySessionCookies(response: NextResponse, value: string) {
  const baseOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };

  const secure =
    (process.env.NEXTAUTH_URL?.startsWith("https://") ?? false) ||
    process.env.NODE_ENV === "production";

  response.cookies.set("next-auth.session-token", value, {
    ...baseOptions,
    secure,
  });

  response.cookies.set("__Secure-next-auth.session-token", value, {
    ...baseOptions,
    secure: true,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.json(
      { error: "NEXTAUTH_SECRET is not configured" },
      { status: 500 }
    );
  }
  const secret = process.env.NEXTAUTH_SECRET as string;

  const body = await req.json().catch(() => null);
  const targetIdentifier = String(body?.userId || body?.id || "").trim();
  if (!targetIdentifier) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const targetUser = await prisma.user.findFirst({
    where: { OR: [{ id: targetIdentifier }, { userId: targetIdentifier }] },
    select: {
      id: true,
      userId: true,
      email: true,
      role: true,
      imageUrl: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = {
    sub: targetUser.id,
    userId: targetUser.userId,
    role: targetUser.role,
    email: targetUser.email ?? null,
    imageUrl: targetUser.imageUrl ?? null,
    impersonatorId: session.user.id,
    impersonatorUserId:
      session.user.userId || (session.user as any).email || "admin",
    impersonatorRole: session.user.role,
    name: targetUser.userId,
  } as any;

  const sessionToken = await encode({
    token,
    secret,
    maxAge: SESSION_MAX_AGE,
  });

  const response = NextResponse.json({
    ok: true,
    actingAs: targetUser.userId,
  });
  applySessionCookies(response, sessionToken);
  return response;
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const impersonatorId = (session.user as any).impersonatorId as
    | string
    | null
    | undefined;
  if (!impersonatorId) {
    return NextResponse.json(
      { error: "Not currently impersonating" },
      { status: 400 }
    );
  }

  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.json(
      { error: "NEXTAUTH_SECRET is not configured" },
      { status: 500 }
    );
  }
  const secret = process.env.NEXTAUTH_SECRET as string;

  const admin = await prisma.user.findUnique({
    where: { id: impersonatorId },
    select: {
      id: true,
      userId: true,
      email: true,
      role: true,
      imageUrl: true,
    },
  });

  if (!admin) {
    return NextResponse.json(
      { error: "Original admin not found" },
      { status: 404 }
    );
  }

  const token = {
    sub: admin.id,
    userId: admin.userId,
    role: admin.role,
    email: admin.email ?? null,
    imageUrl: admin.imageUrl ?? null,
    impersonatorId: null,
    impersonatorUserId: null,
    impersonatorRole: null,
    name: admin.userId,
  } as any;

  const sessionToken = await encode({
    token,
    secret,
    maxAge: SESSION_MAX_AGE,
  });

  const response = NextResponse.json({
    ok: true,
    restoredUserId: admin.userId,
  });
  applySessionCookies(response, sessionToken);
  return response;
}
