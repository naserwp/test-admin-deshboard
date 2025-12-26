import Link from "next/link";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
        VO
      </span>
      <span className="text-lg font-semibold text-slate-900">
        Virtual Office Management
      </span>
    </Link>
  );
}
