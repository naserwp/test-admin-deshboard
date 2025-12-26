import Link from "next/link";
import MarketingNav from "@/app/components/MarketingNav";
import MarketingFooter from "@/app/components/MarketingFooter";

export default function Home() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <MarketingNav />
      </div>

      <main>
        <section className="bg-gradient-to-br from-white via-slate-50 to-indigo-50">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Virtual Office Documents
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Keep every office document organized, secure, and instantly
                accessible.
              </h1>
              <p className="text-lg text-slate-600">
                Virtual Office Management is the modern document hub for remote
                teams. Centralize policies, client files, and workflows with
                clear access controls, audit-ready trails, and a polished
                experience for every employee.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/signup" className="btn btn-primary">
                  Start free trial
                </Link>
                <Link href="/auth/login" className="btn btn-secondary">
                  Book a demo
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 text-sm text-slate-500">
                <div>
                  <p className="text-xl font-semibold text-slate-900">98%</p>
                  <p>faster document retrieval</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">40+</p>
                  <p>integrations ready</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">24/7</p>
                  <p>secure access monitoring</p>
                </div>
              </div>
            </div>
            <div className="card p-6 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-600">
                    Today&apos;s activity
                  </p>
                  <span className="badge badge-info">Live</span>
                </div>
                <div className="grid gap-4">
                  {[
                    {
                      label: "Policy handbook",
                      status: "Approved",
                      color: "badge-success"
                    },
                    {
                      label: "Client onboarding",
                      status: "Pending",
                      color: "badge-warning"
                    },
                    {
                      label: "Vendor contracts",
                      status: "Secured",
                      color: "badge-info"
                    }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          Updated 2 hours ago
                        </p>
                      </div>
                      <span className={`badge ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="card-muted flex items-center justify-between px-4 py-3 text-sm text-slate-600">
                  <span>Team storage usage</span>
                  <span className="font-semibold text-slate-900">68%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr]">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Features
                </p>
                <h2 className="text-3xl font-semibold">
                  A document hub built for distributed offices.
                </h2>
                <p className="text-slate-600">
                  Give every team a home for policies, templates, and critical
                  files while keeping admins fully in control.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    title: "Smart access controls",
                    description:
                      "Lock or unlock documents instantly based on role, project, or status."
                  },
                  {
                    title: "Unified document inbox",
                    description:
                      "See all assigned documents, expirations, and required actions in one view."
                  },
                  {
                    title: "Built-in audit timeline",
                    description:
                      "Track views, downloads, and approvals with a real-time activity log."
                  },
                  {
                    title: "Brand-ready portals",
                    description:
                      "Deliver a consistent, polished experience with custom branding."
                  }
                ].map((feature) => (
                  <div key={feature.title} className="card p-6">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Upload and organize",
                  description:
                    "Drag and drop your PDFs, policies, and templates into dedicated folders."
                },
                {
                  step: "02",
                  title: "Assign and track",
                  description:
                    "Allocate files to teams, set statuses, and monitor completion."
                },
                {
                  step: "03",
                  title: "Stay compliant",
                  description:
                    "Automated logs, version history, and export-ready reports keep audits simple."
                }
              ].map((item) => (
                <div key={item.step} className="card p-6">
                  <p className="text-xs font-semibold text-indigo-600">
                    Step {item.step}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.6fr_0.4fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Document security
                </p>
                <h2 className="text-3xl font-semibold">
                  Security-first storage for sensitive office data.
                </h2>
                <p className="text-slate-600">
                  Keep files protected with access controls, watermarking, and
                  monitored activity. Every download stays tied to a verified
                  employee.
                </p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>• Access-controlled viewing and downloads</li>
                  <li>• Automated lock/unlock workflows</li>
                  <li>• Clear audit trail for compliance reviews</li>
                </ul>
              </div>
              <div className="card p-6">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      Security health
                    </p>
                    <p className="text-3xl font-semibold text-slate-900">
                      99.9%
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Access reviews</span>
                      <span className="font-semibold text-slate-900">
                        Passed
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Download alerts</span>
                      <span className="font-semibold text-slate-900">
                        Enabled
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Security backups</span>
                      <span className="font-semibold text-slate-900">
                        Hourly
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-[0.6fr_0.4fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Pricing teaser
                </p>
                <h2 className="text-3xl font-semibold">
                  Flexible plans for growing teams.
                </h2>
                <p className="text-slate-600">
                  Start with essentials and scale to full compliance workflows
                  as your virtual office expands.
                </p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-slate-500">Starting at</p>
                <p className="mt-2 text-4xl font-semibold text-slate-900">
                  $24<span className="text-lg font-medium">/user</span>
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Includes secure storage, activity logs, and admin controls.
                </p>
                <Link
                  href="/auth/signup"
                  className="btn btn-primary mt-6 w-full"
                >
                  Start a trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Trusted by modern teams
                </p>
                <h2 className="text-3xl font-semibold">
                  Leading companies keep documents in sync.
                </h2>
                <p className="text-slate-600">
                  From distributed consultancies to global operations, teams
                  rely on Virtual Office Management for document clarity.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "Northwind Logistics",
                  "Contoso Finance",
                  "Aurora Clinics",
                  "Nimbus HR",
                  "Summit Legal",
                  "Atlas Ventures"
                ].map((brand) => (
                  <div key={brand} className="card-muted px-4 py-6 text-center text-sm font-semibold text-slate-600">
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  FAQ
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  Common questions from admins.
                </h2>
              </div>
              <div className="space-y-4">
                {[
                  {
                    question: "Can we brand the employee portal?",
                    answer:
                      "Yes. Add your logo, colors, and company messaging for a seamless experience."
                  },
                  {
                    question: "How does document access work?",
                    answer:
                      "Admins can lock or unlock documents per user, with status badges and access logs."
                  },
                  {
                    question: "Is onboarding included?",
                    answer:
                      "Every plan includes guided onboarding resources and a live success team."
                  }
                ].map((item) => (
                  <div key={item.question} className="card p-5">
                    <p className="font-semibold text-slate-900">
                      {item.question}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="card bg-slate-900 p-10 text-white">
              <div className="grid gap-6 lg:grid-cols-[0.65fr_0.35fr] lg:items-center">
                <div>
                  <h2 className="text-3xl font-semibold">
                    Ready to launch your virtual office hub?
                  </h2>
                  <p className="mt-3 text-sm text-slate-200">
                    Launch in minutes, keep every file searchable, and protect
                    sensitive information across your organization.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth/signup" className="btn btn-secondary">
                    Create workspace
                  </Link>
                  <Link href="/auth/login" className="btn btn-muted">
                    Talk to sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
