import { PUBLIC_CONTAINER } from "@/app/components/layout/publicNav";

export default function SecurityPage() {
  return (
    <main className={`${PUBLIC_CONTAINER} space-y-6 py-12`}>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          Security
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Security details, coming soon.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          We&apos;re compiling our security controls, audit policies, and compliance posture.
        </p>
      </div>
      <div className="card p-6 text-sm text-slate-600 dark:text-slate-300">
        Reach out to sales for immediate security documentation.
      </div>
    </main>
  );
}
