import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";

function statusFor(key: string) {
  return process.env[key] ? "Enabled" : "Disabled";
}

export default async function LeadSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div>
        <TopNav role={session.user.role} userName={session.user.userId ?? "User"} />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-lg border bg-white p-6 text-sm">
            You do not have permission to view this page.
          </div>
        </div>
      </div>
    );
  }

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  const providers = [
    { name: "Google Places", env: "GOOGLE_PLACES_API_KEY" },
    { name: "Yelp Fusion", env: "YELP_API_KEY" },
    { name: "OpenCorporates", env: "OPENCORPORATES_API_KEY" },
  ];

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Lead provider settings</h1>
          <p className="text-sm text-slate-600">
            Paid providers are enabled via environment variables. Update your
            deployment secrets and restart the server to activate them.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Provider status</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {providers.map((provider) => (
              <div
                key={provider.env}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {provider.name}
                </p>
                <p className="text-xs text-slate-500">{provider.env}</p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {statusFor(provider.env)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
