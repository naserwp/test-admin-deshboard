import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import AdminUsersClient from "./users-client";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, userId: true, role: true, createdAt: true }
  });

  const userName = session.user.userId || session.user.email || "Admin";
  const imageUrl = (session.user as any).imageUrl;
  const initialUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AdminUsersClient initialUsers={initialUsers} />
      </div>
    </div>
  );
}
