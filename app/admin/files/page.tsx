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

  const userName = session.user.userId ?? "Admin";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Files</h1>
        <UploadForm />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Original Name</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium">{file.title}</td>
                  <td className="px-4 py-3 text-slate-600">{file.originalName}</td>
                  <td className="px-4 py-3 text-slate-600">{file.uploadedByAdmin.userId}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {file.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
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
