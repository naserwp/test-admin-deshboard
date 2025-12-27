// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login"); // …İ…<…İr…İ_…İø login route …İ.…İ"…?…İ_…İ_…Y…?
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-soft-grid opacity-60 dark:opacity-40"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl animate-floaty dark:bg-sky-900/30" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl animate-floaty-slow dark:bg-slate-800/40" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  );
}
