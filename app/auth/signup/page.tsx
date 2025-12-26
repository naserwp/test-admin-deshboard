"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import BrandMark from "@/app/components/BrandMark";

export default function SignupPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email, password })
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Signup failed");
      return;
    }

    setMessage("Account created. You can now sign in.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.55fr_0.45fr]">
        <div className="space-y-6">
          <BrandMark />
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create your virtual office workspace.
          </h1>
          <p className="text-slate-600">
            Give your team a secure document hub with access controls, activity
            tracking, and branded portals.
          </p>
          <div className="card-muted p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              What you&apos;ll get
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Centralized document vault</li>
              <li>• User assignments and statuses</li>
              <li>• Admin-ready audit trails</li>
            </ul>
          </div>
        </div>
        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign up to launch your virtual office document system.
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
              Sign up with Google
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
            or create with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">User ID</label>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                required
                placeholder="company-admin"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="At least 8 characters"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <button type="submit" className="btn btn-primary w-full">
              Sign up
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-slate-900">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
