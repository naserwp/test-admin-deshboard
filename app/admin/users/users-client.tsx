"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  userId: string;
  role: "ADMIN" | "USER";
  createdAt: string;
};

type AdminUsersClientProps = {
  initialUsers: UserRow[];
};

export default function AdminUsersClient({
  initialUsers
}: AdminUsersClientProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [newUserId, setNewUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  async function fetchUsers() {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to load users");
        return;
      }
      setUsers(data.users || []);
    } finally {
      setRefreshing(false);
    }
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: newUserId,
        password: newPassword,
        role: newRole
      })
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">
            Create, manage, and assign roles for workspace users.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={fetchUsers}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Create a new user
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Issue credentials and grant access to the virtual office.
        </p>
        <form onSubmit={onCreate} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              User ID
            </label>
            <input
              value={newUserId}
              onChange={(event) => setNewUserId(event.target.value)}
              placeholder="e.g. team-lead"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Temporary password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              value={newRole}
              onChange={(event) =>
                setNewRole(event.target.value as "USER" | "ADMIN")
              }
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Active users
            </h2>
            <p className="text-sm text-slate-500">
              Update access or remove inactive accounts.
            </p>
          </div>
          <span className="badge badge-info">{users.length} users</span>
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="font-semibold text-slate-900">{user.userId}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "ADMIN"
                        ? "badge-info"
                        : "badge-success"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    type="button"
                    className="text-sm font-semibold text-rose-600 hover:text-rose-500"
                    onClick={() => onDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-slate-500"
                  colSpan={4}
                >
                  No users found. Create the first virtual office user to get
                  started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
