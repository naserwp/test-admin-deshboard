"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { getAvatarColor, getInitials } from "@/app/lib/avatar";

type TopNavProps = {
  role: string;
  userName: string;
  imageUrl?: string | null;
};

export default function TopNav({ role, userName, imageUrl }: TopNavProps) {
  const avatarColor = getAvatarColor(userName);
  const initials = getInitials(userName);

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              VO
            </span>
            <span className="text-lg font-semibold text-slate-900">
              Virtual Office
            </span>
          </Link>
          {role === "ADMIN" && (
            <div className="hidden items-center gap-4 text-sm font-medium text-slate-500 md:flex">
              <Link href="/admin" className="hover:text-slate-900">
                Overview
              </Link>
              <Link href="/admin/users" className="hover:text-slate-900">
                Users
              </Link>
              <Link href="/admin/files" className="hover:text-slate-900">
                Files
              </Link>
              <Link href="/admin/assignments" className="hover:text-slate-900">
                Assignments
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 text-sm text-slate-600 sm:flex">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor}`}
              >
                {initials}
              </span>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {role === "ADMIN" ? "Admin" : "Workspace"}
              </p>
              <p className="font-semibold text-slate-800">{userName}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="btn btn-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
