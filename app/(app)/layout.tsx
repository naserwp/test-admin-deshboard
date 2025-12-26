import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";

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
    <div className="min-h-screen">
      {/* Global Header */}
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />

      {/* Page Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
