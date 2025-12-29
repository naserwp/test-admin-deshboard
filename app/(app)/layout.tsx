import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import GlobalLogo from "@/app/components/GlobalLogo";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // login না থাকলে login page এ পাঠাবে
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userName = session.user.userId || session.user.email || "User";
  const imageUrl = (session.user as any).imageUrl;
  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-soft-grid opacity-60 dark:opacity-40"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-sky-200/45 blur-3xl animate-floaty dark:bg-sky-900/30" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl animate-floaty-slow dark:bg-slate-800/40" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav
          role={session.user.role}
          userName={userName}
          imageUrl={imageUrl}
          impersonatorUserId={impersonatorUserId}
        />

        <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 py-8">
          <div className="surface-section flex-1 p-6 sm:p-8">{children}</div>
        </main>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <GlobalLogo className="scale-90" />
            <span>Virtual Office Management · Secure workspace and AI-enriched leads</span>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
