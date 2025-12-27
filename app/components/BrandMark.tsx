import Link from "next/link";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className }: BrandMarkProps) {
  const classes = className ? ` ${className}` : "";

  return (
    <Link href="/" className={`flex items-center gap-3 text-slate-900 dark:text-slate-100${classes}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 text-sm font-bold text-white shadow-sm">
        VO
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Virtual Office Management
      </span>
    </Link>
  );
}
