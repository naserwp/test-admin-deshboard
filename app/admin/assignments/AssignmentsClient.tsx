"use client";

import { useState } from "react";

type User = { id: string; userId: string };

type File = { id: string; title: string };

type Assignment = {
  id: string;
  status: "LOCKED" | "UNLOCKED";
  user: User;
  file: File;
};

type Props = {
  users: User[];
  files: File[];
  initialAssignments: Assignment[];
};

export default function AssignmentsClient({ users, files, initialAssignments }: Props) {
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const handleAssign = async () => {
    setMessage("");
    setError("");

    if (!selectedFile || selectedUsers.length === 0) {
      setError("Select a file and at least one user.");
      return;
    }

    const response = await fetch("/api/admin/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: selectedFile, userIds: selectedUsers })
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Assignment failed");
      return;
    }

    const payload = await response.json();
    setAssignments(payload.assignments);
    setMessage("Assignments updated.");
    setSelectedUsers([]);
  };

  const toggleStatus = async (assignmentId: string) => {
    const response = await fetch(`/api/admin/assignment/${assignmentId}`, {
      method: "PATCH"
    });

    if (!response.ok) {
      setError("Unable to update assignment");
      return;
    }

    const payload = await response.json();
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: payload.status }
          : assignment
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Select file
          </label>
          <select
            value={selectedFile}
            onChange={(event) => setSelectedFile(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-500/30"
          >
            <option value="">Choose a file</option>
            {files.map((file) => (
              <option key={file.id} value={file.id}>
                {file.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
            Assign to users
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                />
                {user.userId}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-600 dark:text-emerald-300">{message}</p>}
        <button className="btn btn-primary" onClick={handleAssign}>
          Assign
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="table-base">
          <thead>
            <tr>
              <th>User</th>
              <th>File</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="font-semibold text-slate-900 dark:text-slate-100">
                  {assignment.user.userId}
                </td>
                <td className="text-slate-600 dark:text-slate-300">{assignment.file.title}</td>
                <td>
                  <span
                    className={`badge ${
                      assignment.status === "UNLOCKED"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {assignment.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary px-3 py-1 text-xs"
                    onClick={() => toggleStatus(assignment.id)}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={4}>
                  No assignments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
