import Link from "next/link";
import Brand from "./layout/Brand";
import { publicFooterGroups } from "./layout/publicNav";

export default function GlobalFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-soft-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.28),transparent_30%)]" />
      <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <Brand variant="footer" />
          <p className="max-w-xl text-sm text-slate-200">
            Virtual Office Management keeps your documents, leads, and admin workflows in one
            polished, secure surface. AI enrichment, impersonation for support, and multi-channel
            lead sourcing are live today.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-indigo-100">
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
              AI-enriched contacts
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
              Admin impersonation
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
              Secure downloads
            </span>
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur lg:grid-cols-3">
          {publicFooterGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-sm font-semibold text-white/90">{group.title}</p>
              <ul className="space-y-2 text-sm text-slate-200">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="transition hover:text-white hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 text-xs text-slate-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
            ✨
          </span>
          <span>Now shipping multi-channel AI leads and admin impersonation.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/privacy" className="hover:text-white hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white hover:underline">
            Terms
          </Link>
          <Link href="/status" className="hover:text-white hover:underline">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
