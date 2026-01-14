import { PUBLIC_CONTAINER } from "@/app/components/layout/publicNav";

export default function FeaturesPage() {
  return (
    <main className={`${PUBLIC_CONTAINER} space-y-6 py-12`}>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          Features
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Feature highlights, coming soon.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          We&apos;re preparing a full walkthrough of our AI lead intelligence and admin controls.
        </p>
      </div>
      <div className="card p-6 text-sm text-slate-600 dark:text-slate-300">
        Check back shortly for a complete feature breakdown.
      </div>
    </main>
  );
}
