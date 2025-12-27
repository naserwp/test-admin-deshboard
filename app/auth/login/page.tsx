"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import BrandMark from "@/app/components/BrandMark";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.15),transparent_30%)] opacity-70 dark:opacity-50" />
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 animate-floaty rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />
      <div className="pointer-events-none absolute -right-16 bottom-12 h-64 w-64 animate-floaty-slow rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/30" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-8 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <BrandMark />
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-200">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">
              Blog
            </Link>
            <Link href="/auth/signup" className="btn btn-secondary">
              Create account
            </Link>
          </div>
        </header>

        <main className="grid gap-6 rounded-3xl border border-slate-200/60 bg-white/75 p-5 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-800 p-6 text-white shadow-lg dark:border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.2),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="flex items-center justify-between">
                <BrandMark className="text-white" />
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100">
                  Secure AI hub
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Welcome back to your Virtual Office.
                </h1>
                <p className="max-w-xl text-slate-200">
                  Manage every document, assignment, and audit-ready trail with a calm gray-blue UI.
                </p>
                <div className="grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                    Real-time document status
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
                    Secure downloads with audit
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-200" />
                    AI summaries on login
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="h-12 w-12 animate-floaty rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-inner" />
                <div>
                  <p className="text-sm font-semibold">AI Assistant</p>
                  <p className="text-xs text-slate-200">
                    Flags approvals and sends digest updates so you sign in ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-slate-900 via-sky-500 to-slate-900 opacity-60 dark:from-white dark:via-sky-300 dark:to-white" />
              <div className="space-y-1 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
                  Sign in
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Continue to your workspace
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Secure access with gray-blue clarity.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="btn btn-secondary w-full justify-center"
                  disabled={!googleEnabled}
                  onClick={() => {
                    if (googleEnabled) {
                      signIn("google", { callbackUrl: "/dashboard" });
                    }
                  }}
                >
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow">
                    G
                  </span>
                  Sign in with Google
                </button>
                {!googleEnabled && (
                  <p className="text-xs text-center text-slate-400">
                    Enable Google auth with NEXT_PUBLIC_GOOGLE_AUTH_ENABLED.
                  </p>
                )}
              </div>

              <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                or continue with credentials
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email or User ID
                  </label>
                  <div className="group relative rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-sky-500">
                    <input
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      required
                      placeholder="you@company.com"
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Password
                  </label>
                  <div className="group relative rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-sky-500">
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder="Your secure password"
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
                {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

                <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <label className="inline-flex items-center gap-2 rounded-xl bg-slate-100/60 px-3 py-2 dark:bg-slate-800/60">
                    <input type="checkbox" className="h-4 w-4 accent-sky-600 dark:accent-sky-400" />
                    Receive security digests and release notes.
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-xl bg-slate-100/60 px-3 py-2 dark:bg-slate-800/60">
                    <input type="checkbox" className="h-4 w-4 accent-sky-600 dark:accent-sky-400" />
                    Opt out of marketing emails anytime.
                  </label>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-300">
                  By signing in you agree to our{" "}
                  <Link href="/terms" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
                    Privacy
                  </Link>
                  .
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Need an account?
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/auth/signup"
                    className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                  >
                    Create workspace
                  </Link>
                  <Link
                    href="/"
                    className="font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-xs text-slate-500 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
          <span>Virtual Office · Gray-blue crafted UI</span>
          <div className="flex gap-3">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">
              Blog
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
