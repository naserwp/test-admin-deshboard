"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import Avatar from "@/app/components/Avatar";

type TopNavProps = {
  role: string;
  userName: string;
  imageUrl?: string | null;
  impersonatorUserId?: string | null;
};

type NavMatch = {
  href: string;
  exact?: boolean;
};

export default function TopNav({
  role,
  userName,
  imageUrl,
  impersonatorUserId,
}: TopNavProps) {
  const [restoreError, setRestoreError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      businessName: string;
      keyword: string;
      jobId: string;
      createdAt: string;
      email?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
    }>
  >([]);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const notifButtonRef = useRef<HTMLButtonElement | null>(null);
  const notifPanelRef = useRef<HTMLDivElement | null>(null);
  const [notifPosition, setNotifPosition] = useState<{ top: number; left: number }>({
    top: 64,
    left: 0,
  });
  const pathname = usePathname();

  const isImpersonating = Boolean(impersonatorUserId);
  const normalizeMatch = (target: string | NavMatch): NavMatch =>
    typeof target === "string" ? { href: target } : target;
  const isActive = (match: string | NavMatch | Array<string | NavMatch>) => {
    const targets = Array.isArray(match) ? match : [match];
    return targets.some((target) => {
      const { href, exact } = normalizeMatch(target);
      if (!pathname) return false;
      return exact ? pathname === href : pathname.startsWith(href);
    });
  };
  const navItemClass = (match: string | NavMatch | Array<string | NavMatch>) =>
    [
      "rounded-full px-3 py-1 text-sm font-medium transition-all duration-200",
      isActive(match)
        ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70",
    ].join(" ");

  const unseenCount = useMemo(() => {
    if (!lastSeen) return notifications.length;
    const last = new Date(lastSeen).getTime();
    return notifications.filter((n) => new Date(n.createdAt).getTime() > last).length;
  }, [notifications, lastSeen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("vo:lastSeenNotifications");
    if (stored) {
      setLastSeen(stored);
    }
  }, []);

  const markSeen = () => {
    const now = new Date().toISOString();
    setLastSeen(now);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vo:lastSeenNotifications", now);
    }
  };

  const loadNotifications = async () => {
    if (loadingNotifications) return;
    setLoadingNotifications(true);
    try {
      const res = await fetch("/api/user/notifications", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingNotifications(false);
    }
  };

  const toggleNotifications = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      const rect = notifButtonRef.current?.getBoundingClientRect();
      if (rect) {
        const width = 360;
        setNotifPosition({
          top: rect.bottom + 10,
          left: Math.max(12, rect.right - width),
        });
      }
      loadNotifications();
      markSeen();
    }
  };

  // Close notifications on outside click, ESC, scroll, resize
  useEffect(() => {
    if (!notifOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Click inside the panel or the button should not close it
      if (
        notifPanelRef.current?.contains(target) ||
        notifButtonRef.current?.contains(target)
      ) {
        return;
      }

      setNotifOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
      }
    };

    // Scroll/resize are not MouseEvents, so we use a separate handler.
    const handleDismiss = () => {
      setNotifOpen(false);
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [notifOpen]);

  async function handleRestoreAdmin() {
    if (restoring) return;
    setRestoreError("");
    setRestoring(true);

    const res = await fetch("/api/admin/impersonate", { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/admin/users";
      return;
    }

    const data = await res.json().catch(() => ({}));
    setRestoreError(data.error || "Unable to switch back to admin right now.");
    setRestoring(false);
  }

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
            <div className="hidden items-center gap-2 text-sm md:flex">
              <Link
                href="/admin"
                className={navItemClass({ href: "/admin", exact: true })}
              >
                Overview
              </Link>
              <Link href="/admin/users" className={navItemClass("/admin/users")}>
                Users
              </Link>
              <Link href="/admin/files" className={navItemClass("/admin/files")}>
                Files
              </Link>
              <Link href="/admin/assignments" className={navItemClass("/admin/assignments")}>
                Assignments
              </Link>
              <Link href="/admin/leads" className={navItemClass("/admin/leads")}>
                Leads
              </Link>
              <Link href="/admin/blog" className={navItemClass("/admin/blog")}>
                Blog
              </Link>
              <Link
                href="/admin/support/waiting"
                className={navItemClass([
                  { href: "/admin/support/waiting", exact: true },
                  { href: "/admin/support/conversations" },
                  { href: "/admin/support", exact: true },
                ])}
              >
                Support queue
              </Link>
              <Link
                href="/admin/support/tickets"
                className={navItemClass({ href: "/admin/support/tickets" })}
              >
                Tickets
              </Link>
            </div>
          )}

          {role !== "ADMIN" && (
            <div className="hidden items-center gap-2 text-sm md:flex">
              <Link
                href="/dashboard"
                className={navItemClass({ href: "/dashboard", exact: true })}
              >
                Dashboard
              </Link>
              <Link href="/leads" className={navItemClass("/leads")}>
                Leads
              </Link>
              <Link href="/support/tickets" className={navItemClass("/support/tickets")}>
                Support
              </Link>
              <Link href="/support/history" className={navItemClass("/support/history")}>
                Chat history
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              ref={notifButtonRef}
              onClick={toggleNotifications}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              aria-label="Notifications"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"
                />
              </svg>
              {unseenCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold text-white">
                  {unseenCount}
                </span>
              ) : null}
            </button>

            {notifOpen && typeof document !== "undefined"
              ? createPortal(
                  <div
                    ref={notifPanelRef}
                    className="fixed z-[9999] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
                    style={{
                      top: notifPosition.top,
                      left: notifPosition.left,
                    }}
                  >
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <span>Lead notifications</span>
                      {loadingNotifications ? <span>Loading…</span> : null}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.length ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="border-b border-slate-100 px-3 py-3 text-sm dark:border-slate-800"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {notif.businessName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Keyword: {notif.keyword}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {notif.city || notif.state || notif.country
                                    ? [notif.city, notif.state, notif.country].filter(Boolean).join(", ")
                                    : "Location pending"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {notif.email || notif.phone
                                    ? [notif.email, notif.phone].filter(Boolean).join(" • ")
                                    : "Contact pending"}
                                </p>
                              </div>

                                <Link
                                  href={`/leads/${notif.jobId}`}
                                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                                  onClick={() => setNotifOpen(false)}
                                >
                                  Open
                                </Link>
                              </div>

                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No lead notifications yet.
                        </div>
                      )}
                    </div>
                  </div>,
                  document.body
                )
              : null}
          </div>

          {isImpersonating ? (
            <div className="hidden sm:flex flex-col items-end gap-1 text-right text-xs">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/40">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Acting as user (started by {impersonatorUserId})
              </div>
              <button
                onClick={handleRestoreAdmin}
                className="text-amber-800 underline-offset-2 hover:underline disabled:opacity-60 dark:text-amber-200"
                disabled={restoring}
              >
                {restoring ? "Switching..." : "Return to admin"}
              </button>
            </div>
          ) : null}

          <div className="hidden items-center gap-3 text-sm text-slate-600 dark:text-slate-200 sm:flex">
            <Avatar label={userName} imageUrl={imageUrl} size={36} />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-400">
                {role === "ADMIN" ? "Admin" : "Workspace"}
              </p>
              <p className="font-semibold text-slate-800 dark:text-white">{userName}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Sign out"
            title="Sign out"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-4-4l4-4m0 0l-4-4m4 4H3"
              />
            </svg>
          </button>
        </div>
      </div>

      {isImpersonating ? (
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 pb-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/40 dark:bg-amber-500/10">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              You are viewing the workspace as a user.
            </div>
            <button
              onClick={handleRestoreAdmin}
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
              disabled={restoring}
            >
              {restoring ? "Switching..." : "Return to admin"}
            </button>
          </div>

          {restoreError ? <div className="text-rose-600 dark:text-rose-400">{restoreError}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
