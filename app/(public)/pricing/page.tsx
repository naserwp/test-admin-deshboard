import Link from "next/link";
import { PUBLIC_CONTAINER } from "@/app/components/layout/publicNav";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    description: "For early teams exploring the Virtual Office workspace.",
    features: [
      "Core document vault",
      "Team activity timeline",
      "Basic admin roles",
      "Community support",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$29",
    description: "Scale lead ops and compliance with automation.",
    features: [
      "AI lead enrichment",
      "Admin impersonation",
      "Custom workflows",
      "Priority support",
      "Audit-ready exports",
    ],
    cta: "Start a trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored security, onboarding, and multi-team controls.",
    features: [
      "Dedicated success manager",
      "Advanced security policies",
      "Multi-workspace governance",
      "Custom SLAs",
      "Implementation services",
    ],
    cta: "Talk to sales",
  },
];

export default function PricingPage() {
  return (
    <main className={`${PUBLIC_CONTAINER} space-y-12 py-12`}>
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
          Pricing
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Plans built for modern admin teams.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Choose a plan that keeps your virtual office secure, automated, and ready for fast-moving
          operations.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="card flex h-full flex-col justify-between gap-6 p-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                  {tier.name}
                </p>
                <p className="text-4xl font-semibold text-slate-900 dark:text-white">
                  {tier.price}
                  {tier.price !== "Custom" ? (
                    <span className="text-base font-medium text-slate-500 dark:text-slate-300">
                      /user
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {tier.description}
                </p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={tier.name === "Enterprise" ? "/talk-to-sales" : "/auth/signup"}
              className={tier.name === "Enterprise" ? "btn btn-secondary" : "btn btn-primary"}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
