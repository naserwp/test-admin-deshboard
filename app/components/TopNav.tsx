"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import Avatar from "@/app/components/Avatar";
import ThemeToggle from "./ThemeToggle";

type TopNavProps = {
  role: string;
  userName: string;
  imageUrl?: string | null;
};

export default function TopNav({ role, userName, imageUrl }: TopNavProps) {
  return (
    <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 text-sm font-bold text-white shadow-sm">
              VO
            </span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Virtual Office
            </span>
          </Link>
          {role === "ADMIN" && (
            <div className="hidden items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-300 md:flex">
              <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white">
                Overview
              </Link>
              <Link href="/admin/users" className="hover:text-slate-900 dark:hover:text-white">
                Users
              </Link>
              <Link href="/admin/files" className="hover:text-slate-900 dark:hover:text-white">
                Files
              </Link>
              <Link
                href="/admin/assignments"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Assignments
              </Link>
              <Link href="/admin/leads" className="hover:text-slate-900 dark:hover:text-white">
                Leads
              </Link>
              <Link href="/admin/blog" className="hover:text-slate-900 dark:hover:text-white">
                Blog
              </Link>
            </div>
          )}
          {role !== "ADMIN" && (
            <div className="hidden items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-300 md:flex">
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/leads" className="hover:text-slate-900 dark:hover:text-white">
                Leads
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 text-sm text-slate-600 dark:text-slate-200 sm:flex">
            <Avatar label={userName} imageUrl={imageUrl} size={36} />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {role === "ADMIN" ? "Admin" : "Workspace"}
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">{userName}</p>
            </div>
          </div>
          <ThemeToggle compact />
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
