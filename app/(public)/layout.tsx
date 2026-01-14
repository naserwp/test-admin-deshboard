import PublicHeader from "@/app/components/PublicHeader";
import PublicFooter from "@/app/components/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <PublicHeader />
      </div>

      <div className="pt-10">
        {children}
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <PublicFooter />
      </div>
    </div>
  );
}
