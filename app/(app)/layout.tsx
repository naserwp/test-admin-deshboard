import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";

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

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      {/* Global Header */}
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      {/* Page Content */}
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 py-8">
        <div className="flex-1 rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm p-6 sm:p-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
