"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  userId: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  email?: string | null;
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Create form states
  const [newUserId, setNewUserId] = useState("");
  const [newEmail, setNewEmail] = useState(""); // optional if your API supports email
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

    const payload: any = { userId: newUserId, password: newPassword, role: newRole };

    // NOTE: Only send email if you implemented it in your API + Prisma
    if (newEmail.trim()) payload.email = newEmail.trim();

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Create failed");
      return;
    }

    setNewUserId("");
    setNewEmail("");
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
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Create User Card */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-base font-semibold">Create User</h2>
        <p className="text-sm text-slate-600 mb-4">Create a new USER or ADMIN account.</p>

        <form onSubmit={onCreate} className="grid gap-3 max-w-2xl">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">User ID</label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="e.g. user001"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email (optional)</label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@email.com"
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="min 8 characters"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div>
            <button
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">All Users</div>
          <button
            onClick={fetchUsers}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">User ID</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{u.userId}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-red-600 hover:underline" onClick={() => onDelete(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!users.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
