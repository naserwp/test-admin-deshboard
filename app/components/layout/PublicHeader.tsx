"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import {
  publicHomeItem,
  publicProductItems,
  publicTopNavItems,
  type PublicNavItem,
} from "./publicNav";

const PRODUCT_MENU_ID = "product-menu";

export default function PublicHeader() {
  const pathname = usePathname();
  const [isProductOpen, setIsProductOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsProductOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeProductMenu = () => {
    setIsProductOpen(false);
    triggerRef.current?.focus();
  };

  const handleProductKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeProductMenu();
    }
  };

  const isProductActive =
    !!pathname &&
    ["/features", "/how-it-works", "/security"].some((route) =>
      pathname.startsWith(route)
    );

  const isNavItemActive = (item: PublicNavItem) => {
    if (!pathname) return false;
    if (item.id === "home") return pathname === "/";
    if (item.id === "pricing") return pathname.startsWith("/pricing");
    if (item.id === "blog") return pathname.startsWith("/blog");
    if (item.id === "agency") return pathname.startsWith("/agency");
    return false;
  };

  const headerLinkClass = (active: boolean) =>
    [
      "relative inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-indigo-100/80 text-slate-900 shadow-sm dark:bg-indigo-500/20 dark:text-white"
        : "text-slate-600 dark:text-slate-100/80",
      "hover:-translate-y-0.5 hover:text-slate-900 hover:bg-white/70 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]",
      "dark:hover:text-white dark:hover:bg-indigo-500/15 dark:hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
    ].join(" ");

  const headerIconClass = [
    "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
    "text-slate-600 dark:text-slate-100/80",
    "hover:-translate-y-0.5 hover:text-slate-900 hover:bg-white/70 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]",
    "dark:hover:text-white dark:hover:bg-indigo-500/15 dark:hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
  ].join(" ");

  return (
    <header className="sticky top-0 z-50 min-h-[var(--public-header-height)] rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.1),transparent_28%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Brand />
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-100/80"
        >
          <Link
            href={publicHomeItem.href}
            className={headerLinkClass(isNavItemActive(publicHomeItem))}
          >
            {publicHomeItem.label}
          </Link>
          <div className="relative" onKeyDown={handleProductKeyDown}>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsProductOpen((open) => !open)}
              aria-expanded={isProductOpen}
              aria-controls={PRODUCT_MENU_ID}
              aria-haspopup="menu"
              className={headerLinkClass(isProductActive)}
            >
              <span>Product</span>
              <svg
                aria-hidden="true"
                className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                  isProductOpen ? "rotate-180" : "rotate-0"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isProductOpen ? (
              <div
                id={PRODUCT_MENU_ID}
                ref={panelRef}
                role="menu"
                className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200/70 bg-white/90 p-2 text-sm text-slate-700 shadow-xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-950/90 dark:text-slate-100"
              >
                <div className="space-y-1">
                  {publicProductItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:text-slate-100/90 dark:hover:bg-slate-900 dark:hover:text-white"
                      onClick={() => setIsProductOpen(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.stopPropagation();
                          closeProductMenu();
                        }
                      }}
                    >
                      {item.label}
                      <span className="text-xs text-slate-400">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          {publicTopNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={headerLinkClass(isNavItemActive(item))}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/signup" className="btn btn-primary">
            Get started
          </Link>
          <Link
            href="/auth/login"
            className={headerIconClass}
            aria-label="Sign in"
            title="Sign in"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0m6 8v-2a4 4 0 0 0-3-3.87"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
