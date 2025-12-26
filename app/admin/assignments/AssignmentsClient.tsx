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
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Select file</label>
          <select
            value={selectedFile}
            onChange={(event) => setSelectedFile(event.target.value)}
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
          <p className="text-sm font-medium mb-2">Assign to users</p>
          <div className="grid gap-2 md:grid-cols-3">
            {users.map((user) => (
              <label key={user.id} className="flex items-center gap-2 text-sm">
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button className="bg-slate-900 text-white" onClick={handleAssign}>
          Assign
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium">{assignment.user.userId}</td>
                <td className="px-4 py-3 text-slate-600">{assignment.file.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      assignment.status === "UNLOCKED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {assignment.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="bg-slate-200 text-slate-700"
                    onClick={() => toggleStatus(assignment.id)}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
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
