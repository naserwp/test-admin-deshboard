import { ReactNode } from "react";
import Footer from "@/app/components/Footer";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-soft-grid opacity-60 dark:opacity-40"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl animate-floaty dark:bg-sky-900/30" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-200/45 blur-3xl animate-floaty-slow dark:bg-slate-800/40" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col text-slate-900 dark:text-slate-100">
        {children}
        <Footer />
      </div>
    </div>
  );
}
