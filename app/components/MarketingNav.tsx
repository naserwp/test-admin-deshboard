import Link from "next/link";
import BrandMark from "./BrandMark";

export default function MarketingNav() {
  return (
    <nav className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
      <BrandMark />
      <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-200 lg:flex">
        <a href="#features" className="hover:text-slate-900 dark:hover:text-white">
          Features
        </a>
        <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white">
          How it works
        </a>
        <a href="#security" className="hover:text-slate-900 dark:hover:text-white">
          Security
        </a>
        <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">
          Pricing
        </a>
        <a href="#faq" className="hover:text-slate-900 dark:hover:text-white">
          FAQ
        </a>
        <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">
          Blog
        </Link>
        <Link href="/changelog" className="hover:text-slate-900 dark:hover:text-white">
          Changelog
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-white"
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
        <Link href="/auth/signup" className="btn btn-primary">
          Get started
        </Link>
      </div>
    </nav>
  );
}
