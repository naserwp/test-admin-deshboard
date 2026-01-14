"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalLogo from "@/app/components/GlobalLogo";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Changelog", href: "/changelog" },
  { label: "Agency", href: "/agency" },
  { label: "Blog", href: "/blog" },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/75">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <GlobalLogo />
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
