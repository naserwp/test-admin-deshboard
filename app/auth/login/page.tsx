"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import BrandMark from "@/app/components/BrandMark";

export default function LoginPage() {
  // NOTE: userId -> identifier (userId OR email)
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">User ID</label>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          No account? <Link href="/auth/signup" className="text-slate-900">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
