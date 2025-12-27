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

    // NOTE: auth.ts এ আমরা credentials key set করেছি:
    // credentials: { identifier, password }
    // তাই signIn এও identifier পাঠাতে হবে।
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
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.55fr_0.45fr]">
        <div className="space-y-6">
          <BrandMark />
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back to Virtual Office Management.
          </h1>
          <p className="text-slate-600">
            Access your document workspace, review assignments, and keep teams
            aligned from one secure dashboard.
          </p>
          <div className="card-muted p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              You can sign in to
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Review assigned files and status updates</li>
              <li>• Download approved documents safely</li>
              <li>• Track compliance-ready activity logs</li>
            </ul>
          </div>
        </div>
        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use your credentials or connect with Google.
          </p>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              className="btn btn-secondary w-full"
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
              <p className="text-xs text-slate-400">
                Google sign-in is coming soon. Enable it with the
                NEXT_PUBLIC_GOOGLE_AUTH_ENABLED flag.
              </p>
            )}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or continue with credentials
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">User ID or email</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Your secure password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            No account?{" "}
            <Link href="/auth/signup" className="font-semibold text-slate-900">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
