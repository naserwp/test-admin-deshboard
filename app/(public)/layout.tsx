import PublicHeader from "@/app/components/layout/PublicHeader";
import PublicFooter from "@/app/components/layout/PublicFooter";
import { PUBLIC_CONTAINER, PUBLIC_HEADER_HEIGHT } from "@/app/components/layout/publicNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100"
      style={{ "--public-header-height": PUBLIC_HEADER_HEIGHT } as React.CSSProperties}
    >
      <div className={`${PUBLIC_CONTAINER} pt-6`}>
        <PublicHeader />
      </div>

      <main className="pt-[var(--public-header-height)]">
        {children}
      </main>

      <div className={`${PUBLIC_CONTAINER} pb-10`}>
        <PublicFooter />
      </div>
    </div>
  );
}
