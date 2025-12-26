"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type TopNavProps = {
  role: string;
};

export default function TopNav({ role }: TopNavProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          PDF Dashboard
        </Link>
        {role === "ADMIN" && (
          <div className="flex gap-3 text-sm text-slate-600">
            <Link href="/admin">Admin</Link>
            <Link href="/admin/users">Users</Link>
            <Link href="/admin/files">Files</Link>
            <Link href="/admin/assignments">Assignments</Link>
          </div>
        )}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="bg-slate-900 text-white"
      >
        Sign out
      </button>
    </div>
  );
}
