import Link from "next/link";

const pillars = [
  {
    title: "Demand gen that adapts",
    copy: "AI-synthesized lead lists with verified emails, phones, and location. Swap targeting without waiting on ops.",
  },
  {
    title: "Admin-grade control",
    copy: "Impersonate stuck users, reset access, and ship support fixes in minutes with full audit trails.",
  },
  {
    title: "Creative + data in one surface",
    copy: "Landing pages, blog drops, and changelog updates ship from the same brand-safe UI—no context switching.",
  },
];

const services = [
  "Multi-channel lead sourcing (Google, LinkedIn-style signals, directories)",
  "Campaign briefs with AI context and instant assets",
  "Secure document hubs for proposals and SOWs",
  "Real-time client views via impersonation (with guardrails)",
  "Dark-mode ready presentations and exports",
];

export default function AgencyPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 shadow-soft-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.3),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.25),transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-100 ring-1 ring-white/10">
                Agency mode • New
              </div>
              <h1 className="text-4xl font-semibold leading-tight">
                Dark-mode growth studio powered by Virtual Office.
              </h1>
              <p className="text-sm text-slate-200">
                Build campaigns, validate leads, and share client-ready workspaces with a single,
                animated surface. Every touchpoint stays on-brand, auditable, and instantly editable.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Launch agency workspace
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/15"
                >
                  Enter dashboard
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-800/50 via-slate-900/60 to-slate-950/80 p-6 shadow-lg ring-1 ring-indigo-200/30">
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/30 blur-3xl" />
              <div className="absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-sky-400/30 blur-3xl" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-indigo-100">
                  <span>Live deck</span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px]">Animation</span>
                </div>
                <div className="space-y-3">
                  <div className="h-36 overflow-hidden rounded-xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center shadow-inner">
                    <div className="h-full w-full animate-pulse-slow bg-gradient-to-br from-black/50 via-slate-900/50 to-slate-950/60" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100 shadow-inner">
                      <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">Leads</p>
                      <p className="text-lg font-semibold">AI + multi-channel</p>
                      <p className="text-xs text-slate-300">Email, phone, address validated</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100 shadow-inner">
                      <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">Ops</p>
                      <p className="text-lg font-semibold">Admin impersonation</p>
                      <p className="text-xs text-slate-300">Support clients instantly</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Motion-ready hero, dark theme intact
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-sm ring-1 ring-white/5 transition hover:-translate-y-1 hover:ring-indigo-400/40"
            >
              <p className="text-sm font-semibold text-indigo-200">{pillar.title}</p>
              <p className="mt-2 text-sm text-slate-200">{pillar.copy}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-soft-xl ring-1 ring-white/5 lg:grid-cols-[0.65fr_0.35fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-indigo-200">Services</p>
            <h2 className="text-2xl font-semibold">Full-stack marketing delivery</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {services.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-900/60 via-slate-900/60 to-slate-950/70 p-5 text-sm text-slate-100 shadow-inner ring-1 ring-indigo-200/30">
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">CTA</p>
            <p className="mt-2 text-lg font-semibold">Need campaign help?</p>
            <p className="mt-2 text-sm text-slate-300">
              Book a walkthrough of the Virtual Office agency workspace. We’ll preload your ICP,
              industries, and sample assets.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Book onboarding
              </Link>
              <Link
                href="/talk-to-sales"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/15"
              >
                Talk to sales
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/15"
              >
                View workspace
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
