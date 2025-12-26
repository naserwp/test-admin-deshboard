"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import BrandMark from "@/app/components/BrandMark";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
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
      userId,
      password
    });

    if (result?.error) {
      setError("Invalid credentials");
    } else {
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.55fr_0.45fr]">
        <div className="space-y-6">
          <BrandMark />
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back to your virtual office.
          </h1>
          <p className="text-slate-600">
            Access your documents, manage assigned files, and stay on top of
            workflow updates in one secure portal.
          </p>
          <div className="card-muted p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              Trusted by distributed teams
            </p>
            <p className="mt-2">
              Secure files, approvals, and audit trails with one sign-in.
            </p>
          </div>
        </div>
        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use your Virtual Office credentials to continue.
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
              Continue with Google
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
            or sign in with credentials
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">User ID</label>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                required
                placeholder="Enter your user ID"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="••••••••"
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
