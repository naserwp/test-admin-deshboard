import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { logError } from "@/app/lib/log";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json(session ?? null);
  } catch (error) {
    logError("auth.session_failed", error);
    return NextResponse.json(null, { status: 200 });
  }
}
