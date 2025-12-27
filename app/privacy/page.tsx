import Link from "next/link";
import MarketingNav from "@/app/components/MarketingNav";
import MarketingFooter from "@/app/components/MarketingFooter";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <MarketingNav />
        <main className="mt-10 space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
              Privacy
            </p>
            <h1 className="text-3xl font-semibold">Privacy Policy</h1>
            <p className="text-slate-600 dark:text-slate-300">
              How we collect, use, store, and protect your data when you use Virtual Office.
            </p>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <p>
              We collect necessary profile and usage data to operate the service, improve features, and provide support.
              Access is role-based, and audit logs track key actions.
            </p>
            <p>
              Data is encrypted in transit and at rest. We do not sell personal data. Third-party processors are vetted and
              bound by appropriate data protection agreements.
            </p>
            <p>
              You can request access, correction, or deletion of your personal data, subject to legal retention
              requirements. Cookies are used for authentication and session continuity only.
            </p>
            <p>
              Contact{" "}
              <a href="mailto:privacy@virtualoffice.example" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
                privacy@virtualoffice.example
              </a>{" "}
              for any privacy requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/terms" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
              View Terms of Service
            </Link>
            <Link href="/" className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white">
              Back to home
            </Link>
          </div>
        </main>
      </div>
      <MarketingFooter />
    </div>
  );
}
