import BrandMark from "./BrandMark";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-sm text-sm text-slate-500">
            Virtual Office Management gives teams a secure, branded workspace to
            store, organize, and share critical office documents.
          </p>
        </div>
        <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Product
            </p>
            <p>Document vault</p>
            <p>Audit trails</p>
            <p>Access controls</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Company
            </p>
            <p>Security</p>
            <p>Support</p>
            <p>Contact</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
