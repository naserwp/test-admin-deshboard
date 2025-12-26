import Link from "next/link";
import BrandMark from "./BrandMark";

export default function MarketingNav() {
  return (
    <nav className="flex items-center justify-between py-6">
      <BrandMark />
      <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
        <a href="#features" className="hover:text-slate-900">
          Features
        </a>
        <a href="#how-it-works" className="hover:text-slate-900">
          How it works
        </a>
        <a href="#security" className="hover:text-slate-900">
          Security
        </a>
        <a href="#pricing" className="hover:text-slate-900">
          Pricing
        </a>
        <a href="#faq" className="hover:text-slate-900">
          FAQ
        </a>
      </div>
      <div className="flex items-center gap-3">
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
