import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <main className="mt-10 space-y-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
              Terms of Service
            </p>
            <h1 className="text-3xl font-semibold">Virtual Office Terms</h1>
            <p className="text-slate-600 dark:text-slate-300">
              These terms explain how you use Virtual Office, your responsibilities, and how we protect your data.
            </p>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <p>
              By accessing Virtual Office, you agree to abide by applicable laws, keep credentials secure, and avoid misuse
              of the platform. Content you upload should respect confidentiality and legal obligations.
            </p>
            <p>
              We provide uptime commitments, security controls, and audit trails; however, we do not guarantee error-free
              operation. We may update features; material changes will be communicated in advance.
            </p>
            <p>
              Data processing follows our Privacy Policy. You may request export or deletion of personal data subject to legal
              retention requirements.
            </p>
            <p>
              For questions, contact{" "}
              <a href="mailto:support@virtualoffice.example" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
                support@virtualoffice.example
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/privacy" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
              View Privacy Policy
            </Link>
            <Link href="/" className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white">
              Back to home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
