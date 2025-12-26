import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSession } from "@/app/lib/requireAuth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const id = (session.user as any).id;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "Password too short" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user?.passwordHash) {
      // Google-only user হলে passwordHash নাও থাকতে পারে
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!ok)
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );

    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
