import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import MarketingNav from "@/app/components/MarketingNav";
import GlobalFooter from "@/app/components/GlobalFooter";
import DocumentRequestForm from "@/app/documents/request/DocumentRequestForm";
import Link from "next/link";

export default async function DocumentRequestPage() {
  const session = await getServerSession(authOptions);
  const defaultName =
    session?.user?.userId ?? (session?.user as any)?.name ?? (session?.user as any)?.email ?? "";
  const defaultEmail = (session?.user as any)?.email ?? "";
  const defaultPhone = "";
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.15),transparent_30%)] opacity-70 dark:opacity-50" />
      <div className="relative mx-auto max-w-6xl px-6 pt-6">
        <MarketingNav />
      </div>

      <main className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.6fr_0.4fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:bg-slate-800 dark:text-indigo-200">
                Business document request
              </p>
              <h1 className="text-3xl font-semibold">Request any business document.</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tell us what you need and we’ll coordinate the research, filings, or document pulls
                on your behalf.
              </p>
            </div>

            <DocumentRequestForm
              defaultName={defaultName}
              defaultEmail={defaultEmail}
              defaultPhone={defaultPhone}
              isLoggedIn={isLoggedIn}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <h2 className="text-lg font-semibold">Common requests</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>• Certificates of good standing</li>
                <li>• Formation and registration documents</li>
                <li>• UCC searches and filings</li>
                <li>• Annual report copies</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Need help right away?
              </p>
              <p className="mt-2">
                Use the support ticket flow for urgent requests or follow-ups.
              </p>
              <Link
                href="/support/ticket/new"
                className="mt-3 inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                Create a support ticket →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <GlobalFooter />
      </div>
    </div>
  );
}
