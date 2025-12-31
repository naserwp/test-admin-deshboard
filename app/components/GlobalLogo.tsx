import VoiceIcon from "./VoiceIcon";

type GlobalLogoProps = {
  className?: string;
  variant?: "header" | "footer";
};

export default function GlobalLogo({ className = "", variant = "header" }: GlobalLogoProps) {
  const isFooter = variant === "footer";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-400 shadow-lg ring-4 ring-indigo-100/70 dark:ring-indigo-900/60">
        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-2xl bg-gradient-to-br from-white/70 via-white/10 to-indigo-200/40 blur-2xl dark:from-indigo-200/10 dark:via-indigo-400/5 dark:to-sky-200/5" />
        <VoiceIcon className="absolute bottom-2 right-2 h-4 w-4 text-white/80" />
        <div className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-white drop-shadow-md">
          VO
        </div>
      </div>
      <div className="leading-tight">
        <p className="text-xs uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-300">
          Virtual Office
        </p>
        <p
          className={`text-lg font-semibold ${
            isFooter ? "text-white" : "text-slate-900 dark:text-white"
          }`}
        >
          Management
        </p>
      </div>
    </div>
  );
}
