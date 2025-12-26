"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  // NOTE: userId -> identifier (userId OR email)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-slate-600">
          Use your User ID or Email to sign in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">User ID or Email</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="e.g. naserdev or naser@email.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 py-2 font-medium text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link href="/auth/signup" className="font-medium text-slate-900">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
