import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import UploadForm from "./UploadForm";

export default async function AdminFilesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const files = await prisma.file.findMany({
    include: { uploadedByAdmin: true },
    orderBy: { createdAt: "desc" }
  });

  const userName = session.user.userId || session.user.email || "Admin";
  const imageUrl = (session.user as any).imageUrl;
  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  return (
    <div>
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
        impersonatorUserId={impersonatorUserId}
      />
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6 text-slate-900 dark:text-slate-100">
        <h1 className="text-2xl font-semibold">Files</h1>
        <UploadForm />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Original Name</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {file.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {file.originalName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {file.uploadedByAdmin.userId}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {file.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={4}>
                    No files uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
