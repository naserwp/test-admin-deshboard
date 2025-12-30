"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  userId: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  email?: string | null;
  canRequestLeads?: boolean;
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
  const [newCanRequestLeads, setNewCanRequestLeads] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<"USER" | "ADMIN">("USER");
  const [editPassword, setEditPassword] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

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

    const payload: any = {
      userId: newUserId,
      password: newPassword,
      role: newRole,
      canRequestLeads: newCanRequestLeads,
    };

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
    setNewCanRequestLeads(false);
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

  async function onToggleLeadsAccess(user: UserRow) {
    setError("");
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canRequestLeads: !user.canRequestLeads }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    await fetchUsers();
  }

  async function onImpersonate(user: UserRow) {
    if (!confirm(`Login as ${user.userId}?`)) return;
    setError("");
    setImpersonatingId(user.id);

    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Unable to switch into user");
      setImpersonatingId(null);
      return;
    }

    window.location.href = "/dashboard";
  }

  function startEdit(user: UserRow) {
    setEditingId(user.id);
    setEditRole(user.role);
    setEditPassword("");
  }

  async function onSaveEdit(user: UserRow) {
    setSavingId(user.id);
    setError("");
    const payload: any = { role: editRole };
    if (editPassword.trim()) {
      payload.password = editPassword.trim();
    }

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSavingId(null);
      setError(data.error || "Update failed");
      return;
    }
    setEditingId(null);
    setSavingId(null);
    await fetchUsers();
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {/* Create User Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Create User</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Create a new USER or ADMIN account.
        </p>

        <form onSubmit={onCreate} className="grid gap-3 max-w-2xl">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">User ID</label>
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-300"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="e.g. user001"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Email (optional)
              </label>
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-300"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@email.com"
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-300"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="min 8 characters"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-300"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={newCanRequestLeads}
              onChange={(e) => setNewCanRequestLeads(e.target.checked)}
            />
            Allow lead requests
          </label>

          <div>
            <button
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div className="font-semibold text-slate-900 dark:text-slate-100">All Users</div>
          <button
            onClick={fetchUsers}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="text-left px-4 py-3">User ID</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Leads access</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {u.userId}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {u.email ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleLeadsAccess(u)}
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                        u.canRequestLeads
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30"
                          : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
                      ].join(" ")}
                    >
                      {u.canRequestLeads ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-xs font-semibold">
                      {editingId === u.id ? (
                        <>
                          <select
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <input
                            type="password"
                            placeholder="New password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                          />
                          <button
                            onClick={() => onSaveEdit(u)}
                            className="text-emerald-700 hover:underline dark:text-emerald-300"
                            disabled={savingId === u.id}
                          >
                            {savingId === u.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-slate-500 hover:underline dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-indigo-700 hover:underline dark:text-indigo-300"
                            onClick={() => onImpersonate(u)}
                            disabled={impersonatingId === u.id}
                          >
                            {impersonatingId === u.id ? "Switching..." : "Login as user"}
                          </button>
                          <button
                            className="text-slate-700 hover:underline dark:text-slate-200"
                            onClick={() => startEdit(u)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline dark:text-red-400"
                            onClick={() => onDelete(u.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!users.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
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
