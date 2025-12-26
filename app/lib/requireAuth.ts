import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  // আপনার session.user.id আছে কিনা নিশ্চিত করা
  if (!session?.user || !(session.user as any).id) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}
