import Link from "next/link";
import GlobalHeader from "@/app/components/GlobalHeader";
import GlobalFooter from "@/app/components/GlobalFooter";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "account-login", label: "Account & Login" },
  { id: "support-tickets", label: "Support Tickets" },
  { id: "talk-to-sales", label: "Talk to Sales" },
  { id: "agency-workspace", label: "Agency Workspace" },
  { id: "faq", label: "FAQ" },
];

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/30" />
        <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-6">
        <GlobalHeader />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100 shadow-sm dark:bg-slate-900/80 dark:text-indigo-200 dark:ring-slate-800">
            Platform docs
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Virtual Office Documentation
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Everything you need to understand business information services, support workflows,
              Talk to Sales, and agency workspace onboarding.
            </p>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 text-xs font-semibold">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <section id="overview" className="space-y-3">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Virtual Office is a business information hub that combines business document services,
            customer support, and agency operations in a single workspace.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>• Business information services for document pulls and filings.</li>
            <li>• Support & tickets for customer help and admin responses.</li>
            <li>• Talk to Sales to connect with the onboarding team.</li>
            <li>• Agency workspace launches for marketing and client delivery.</li>
            <li>
              • Business document requests via{" "}
              <Link
                href="/documents/request"
                className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                Document Request
              </Link>
              .
            </li>
          </ul>
        </section>

        <section id="getting-started" className="space-y-3">
          <h2 className="text-2xl font-semibold">Getting Started</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            New users begin by creating an account or requesting a sales walkthrough. After
            signup, the workspace opens with the admin dashboard, support tools, and document
            services.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The onboarding flow includes workspace setup, branding, and access to support ticket
            history. Get started via{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Signup
            </Link>{" "}
            or{" "}
            <Link
              href="/talk-to-sales"
              className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Talk to Sales
            </Link>
            .
          </p>
        </section>

        <section id="account-login" className="space-y-3">
          <h2 className="text-2xl font-semibold">Account & Login</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Sign in with your email and password to access admin and user dashboards. Logged-in
            users can view ticket history, manage files, and submit document requests with saved
            details.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Non-logged-in visitors can still request documents or contact support, but they must
            provide contact information on each request.
          </p>
        </section>

        <section id="support-tickets" className="space-y-3">
          <h2 className="text-2xl font-semibold">Support Tickets</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Support tickets can be created from the support request flow and are tracked in the
            dashboard. Admins receive notifications and respond directly in the support panel.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Users can monitor status updates and view replies in their ticket history. Start a
            ticket from{" "}
            <Link
              href="/support/ticket/new"
              className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Support Request
            </Link>
            .
          </p>
        </section>

        <section id="talk-to-sales" className="space-y-3">
          <h2 className="text-2xl font-semibold">Talk to Sales</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Talk to Sales is designed for teams who want a walkthrough, onboarding help, or
            customized workspace setup. Use it when you need pricing guidance or agency-level
            planning.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Submitted leads appear in the admin support area for follow-up. Visit{" "}
            <Link
              href="/talk-to-sales"
              className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Talk to Sales
            </Link>{" "}
            to start the request.
          </p>
        </section>

        <section id="agency-workspace" className="space-y-3">
          <h2 className="text-2xl font-semibold">Agency Workspace</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Launch the agency workspace to manage campaigns, client documents, and support in one
            place. The onboarding CTA schedules a walkthrough and configures lead sourcing and
            branding.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Use Book onboarding to align on timelines and deliverables before launching. Visit{" "}
            <Link
              href="/agency"
              className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Agency Workspace
            </Link>{" "}
            to start.
          </p>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Can I request documents without an account?",
                a: "Yes. Provide your contact details and we’ll follow up.",
              },
              {
                q: "Where do Talk to Sales leads go?",
                a: "They appear in the admin support area for follow-up.",
              },
              {
                q: "How do I check ticket status?",
                a: "Logged-in users can see updates in their support history.",
              },
              {
                q: "What document types are supported?",
                a: "Any business filing, registration, or public record request.",
              },
              {
                q: "How quickly will I hear back?",
                a: "Most requests receive a response within one business day.",
              },
              {
                q: "Can I book onboarding for agency work?",
                a: "Yes, use the agency CTA to schedule a walkthrough.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.q}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Need a document fast?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit a request and we’ll confirm the next steps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/documents/request" className="btn btn-primary">
              Request a document
            </Link>
            <Link href="/support/ticket/new" className="btn btn-secondary">
              Contact support
            </Link>
          </div>
        </footer>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <GlobalFooter />
      </div>
    </div>
  );
}
