// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import TopNav from "@/app/components/TopNav";
// import AdminUsersClient from "./AdminUsersClient";

// export default async function AdminUsersPage() {
//   const session = await getServerSession(authOptions);

//   // Basic auth guard
//   if (!session?.user?.id) {
//     return null;
//   }

//   // Optional: admin-only guard (recommended)
//   if (session.user.role !== "ADMIN") {
//     return (
//       <div>
//         <TopNav role={session.user.role} userName={session.user.userId ?? "User"} />
//         <div className="mx-auto max-w-5xl px-6 py-10">
//           <div className="rounded-lg border bg-white p-6 text-sm">
//             You do not have permission to view this page.
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const userName = session.user.userId ?? session.user.email ?? "Admin";

//   return (
//     <div>
//       <TopNav role={session.user.role} userName={userName} />
//       <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
//         <div>
//           <h1 className="text-2xl font-semibold">Admin • Users</h1>
//           <p className="text-sm text-slate-600">Create and manage user accounts.</p>
//         </div>

//         {/* Client UI that calls /api/admin/users */}
//         <AdminUsersClient />
//       </div>
//     </div>
//   );
// }


import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  if (session.user.role !== "ADMIN") {
    return (
      <div>
        <TopNav
          role={session.user.role}
          userName={session.user.userId ?? "User"}
          impersonatorUserId={impersonatorUserId}
        />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            You do not have permission to view this page.
          </div>
        </div>
      </div>
    );
  }

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav
        role={session.user.role}
        userName={userName}
        impersonatorUserId={impersonatorUserId}
      />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin • Users</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create and manage user accounts.
          </p>
        </div>

        <AdminUsersClient />
      </div>
    </div>
  );
}
