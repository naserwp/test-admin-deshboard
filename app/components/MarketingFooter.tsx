import BrandMark from "./BrandMark";

export default function MarketingFooter() {
  return (
    <footer className="relative mt-16 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-slate-900 via-sky-700 to-slate-900 opacity-60" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm text-slate-600 sm:px-6 md:grid-cols-[1.2fr_1fr] dark:text-slate-300">
        <div className="space-y-4">
          <BrandMark />
          <p className="max-w-xl text-slate-600 dark:text-slate-300">
            Virtual Office Management gives teams a secure, branded workspace to
            store, organize, and share critical office documents with a cohesive
            gray-blue theme.
          </p>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70">
              Secure by default
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70">
              Built for teams
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70">
              Gray-blue UI
            </span>
          </div>
        </div>
        <div className="grid gap-6 text-sm sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Product
            </p>
            <p className="text-slate-700 dark:text-slate-200">Document vault</p>
            <p className="text-slate-700 dark:text-slate-200">Audit trails</p>
            <p className="text-slate-700 dark:text-slate-200">Access controls</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Company
            </p>
            <p className="text-slate-700 dark:text-slate-200">Security</p>
            <p className="text-slate-700 dark:text-slate-200">Support</p>
            <p className="text-slate-700 dark:text-slate-200">Contact</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
