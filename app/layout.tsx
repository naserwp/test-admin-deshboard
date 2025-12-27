import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ThemeToggle from "@/app/components/ThemeToggle";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import CursorGlow from "@/app/components/CursorGlow";

export const metadata: Metadata = {
  title: "Virtual Office Documents",
  description: "Virtual Office Management for secure document workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <CursorGlow />
          <div className="relative isolate min-h-screen overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 -z-20 bg-soft-grid opacity-70 dark:opacity-40"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-28 -right-20 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl animate-floaty dark:bg-sky-900/40" />
              <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl animate-floaty-slow dark:bg-slate-800/50" />
              <div className="absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl animate-floaty-glide dark:bg-blue-900/30" />
            </div>

            <div className="relative z-10 min-h-screen">
              {children}
              <div className="fixed left-4 top-1/2 z-50 -translate-y-1/2 md:left-8">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3200,
              className:
                "rounded-xl border border-slate-200/70 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:border-slate-700 dark:bg-slate-100 dark:text-slate-900",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
