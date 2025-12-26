// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import TopNav from "@/app/components/TopNav";

// export default async function AdminUsersPage() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return null;
//   }

//   const users = await prisma.user.findMany({
//     orderBy: { createdAt: "desc" }
//   });

//   return (
//     <div>
//       <TopNav role={session.user.role} />
//       <div className="mx-auto max-w-5xl px-6 py-8">
//         <h1 className="mb-6 text-2xl font-semibold">Users</h1>
//         <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-100 text-slate-600">
//               <tr>
//                 <th className="px-4 py-3">User ID</th>
//                 <th className="px-4 py-3">Role</th>
//                 <th className="px-4 py-3">Created</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((user) => (
//                 <tr key={user.id} className="border-t border-slate-200">
//                   <td className="px-4 py-3 font-medium">{user.userId}</td>
//                   <td className="px-4 py-3 text-slate-600">{user.role}</td>
//                   <td className="px-4 py-3 text-slate-600">
//                     {user.createdAt.toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//               {users.length === 0 && (
//                 <tr>
//                   <td className="px-4 py-6 text-center text-slate-500" colSpan={3}>
//                     No users yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  userId: string;
  role: "ADMIN" | "USER";
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Create form states
  const [newUserId, setNewUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  async function fetchUsers() {
    setError("");
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to load users");
      return;
    }
    setUsers(data.users || []);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newUserId, password: newPassword, role: newRole }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Create failed");
      return;
    }

    setNewUserId("");
    setNewPassword("");
    setNewRole("USER");
    setLoading(false);
    await fetchUsers();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    setError("");

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    await fetchUsers();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Admin • Users</h1>

      {error ? <div className="border rounded p-3 text-sm text-red-600">{error}</div> : null}

      <form onSubmit={onCreate} className="border rounded p-4 space-y-3 max-w-xl">
        <div className="space-y-1">
          <label className="text-sm">User ID</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="e.g. user001"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="min 6 characters"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as any)}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <button disabled={loading} className="bg-black text-white rounded px-4 py-2">
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">User ID</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.userId}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <button className="text-red-600" onClick={() => onDelete(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td colSpan={4} className="p-3 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
