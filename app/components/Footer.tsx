export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-slate-900 via-sky-700 to-slate-900 opacity-40" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Virtual Office
        </span>
        <span>© {year}</span>
      </div>
    </footer>
  );
}
