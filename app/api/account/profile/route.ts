import { NextResponse } from "next/server";
import { requireSession } from "@/app/lib/requireAuth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const id = (session.user as any).id;

    const body = await req.json();
    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : undefined;
    const userId = body.userId ? String(body.userId).trim() : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(email ? { email } : {}),
        ...(userId ? { userId } : {}),
      },
      select: {
        id: true,
        userId: true,
        email: true,
        imageUrl: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Profile update failed" },
      { status: 400 }
    );
  }
}
