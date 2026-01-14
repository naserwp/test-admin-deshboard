import { PUBLIC_CONTAINER } from "@/app/components/layout/publicNav";

export default function HowItWorksPage() {
  return (
    <main className={`${PUBLIC_CONTAINER} space-y-6 py-12`}>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          How it works
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          A guided tour is on the way.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Soon you&apos;ll see how Virtual Office connects documents, leads, and admin workflows.
        </p>
      </div>
      <div className="card p-6 text-sm text-slate-600 dark:text-slate-300">
        Stay tuned for detailed workflow demos.
      </div>
    </main>
  );
}
