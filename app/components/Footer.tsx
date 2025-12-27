export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-slate-900 via-sky-700 to-slate-900 opacity-60" />
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-6 dark:text-slate-400">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 text-xs font-bold uppercase text-white shadow-sm">
            VO
          </span>
          <div>
            <p className="text-sm font-semibold">Virtual Office</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gray-blue workspace for every document flow.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            (c) {year} Virtual Office. All rights reserved.
          </span>
          <div className="flex gap-3 text-slate-500 dark:text-slate-400">
            <a href="/blog" className="hover:text-slate-900 dark:hover:text-white">
              Blog
            </a>
            <a href="/auth/login" className="hover:text-slate-900 dark:hover:text-white">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
