import Link from "next/link";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

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
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <Link href="/auth/login" className="btn btn-secondary">
          Sign in
        </Link>
        <Link href="/auth/signup" className="btn btn-primary">
          Get started
        </Link>
      </div>
    </nav>
  );
}
