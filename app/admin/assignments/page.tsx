import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import AssignmentsClient from "./AssignmentsClient";

export default async function AdminAssignmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const [users, files, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, userId: true }
    }),
    prisma.file.findMany({
      select: { id: true, title: true }
    }),
    prisma.assignment.findMany({
      include: {
        user: { select: { id: true, userId: true } },
        file: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div>
      <TopNav role={session.user.role} />
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <AssignmentsClient
          users={users}
          files={files}
          initialAssignments={assignments}
        />
      </div>
    </div>
  );
}
