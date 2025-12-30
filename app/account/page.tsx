"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type User = {
  id: string;
  userId: string | null;
  email: string | null;
  role: string;
  imageUrl: string | null;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [busy, setBusy] = useState(false);

  const initials = useMemo(() => {
    const base = (userId || email || "U").trim();
    return base.slice(0, 1).toUpperCase();
  }, [userId, email]);

  async function loadMe(silent = false) {
    try {
      const res = await fetch("/api/account/me", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUser(data.user);
      setUserId(data.user?.userId || "");
      setEmail(data.user?.email || "");
      if (!silent) toast.success("Account refreshed");
    } catch {
      if (!silent) toast.error("Could not load account info");
    }
  }

  useEffect(() => {
    loadMe(true);
  }, []);

  async function saveProfile() {
    setBusy(true);
    const t = toast.loading("Saving profile...");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Profile update failed");
      setUser(data.user);
      toast.success("Profile updated", { id: t });
    } catch (e: any) {
      toast.error(e?.message || "Profile update failed", { id: t });
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File) {
    const t = toast.loading("Uploading photo...");
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      await loadMe(true);
      toast.success("Photo updated", { id: t });
    } catch (e: any) {
      toast.error(e?.message || "Upload failed", { id: t });
    }
  }

  async function removeAvatar() {
    const t = toast.loading("Removing photo...");
    try {
      const res = await fetch("/api/account/avatar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Remove failed");

      await loadMe(true);
      toast.success("Photo removed", { id: t });
    } catch (e: any) {
      toast.error(e?.message || "Remove failed", { id: t });
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setBusy(true);
    const t = toast.loading("Updating password...");
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Password update failed");

      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated", { id: t });
    } catch (e: any) {
      toast.error(e?.message || "Password update failed", { id: t });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 text-slate-900 dark:text-slate-100">
      {/* Page header (dashboard-like) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 p-[2px] shadow-sm">
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-lg font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-300">Account</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Update your profile, photo, and password.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadMe(false)}
            disabled={busy}
            className={cx(
              "btn btn-secondary px-4 py-2 text-sm",
              "transition active:scale-[0.98] disabled:opacity-50"
            )}
          >
            Refresh
          </button>

          <button
            onClick={saveProfile}
            disabled={busy}
            className={cx(
              "btn btn-primary px-4 py-2 text-sm",
              "transition active:scale-[0.98] disabled:opacity-50"
            )}
          >
            Save changes
          </button>

          <Link
            href="/dashboard"
            className={cx(
              "btn btn-secondary px-4 py-2 text-sm",
              "transition active:scale-[0.98]"
            )}
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Stats row (small, dashboard-like) */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">Role</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {user?.role || "USER"}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Access level for this workspace.
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">Email</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100 break-all">
            {email || "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Used for notifications and login.
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">Profile photo</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {user?.imageUrl ? "Set" : "Not set"}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Recommended 400×400.</p>
        </div>
      </div>

      {/* Main content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Profile
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Basic account information.
                </p>
              </div>
              <span className="badge badge-info">Settings</span>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    User ID
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g., nasir"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={saveProfile}
                  disabled={busy}
                  className={cx(
                    "btn btn-primary px-4 py-2 text-sm",
                    "transition active:scale-[0.98] disabled:opacity-50"
                  )}
                >
                  Save profile
                </button>
              </div>
            </div>
          </div>

          {/* Password card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Security
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">Update your password.</p>
              </div>
              <span className="badge badge-warning">Protected</span>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Current password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    New password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={changePassword}
                  disabled={busy}
                  className={cx(
                    "btn btn-primary px-4 py-2 text-sm",
                    "transition active:scale-[0.98] disabled:opacity-50"
                  )}
                >
                  Update password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Photo card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Profile photo
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">Upload JPG/PNG/WEBP.</p>
              </div>
              <span className="badge badge-success">Optional</span>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-200">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {userId || email || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Recommended: 400×400</p>
                </div>
              </div>

              <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                Upload photo
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <button
                onClick={removeAvatar}
                disabled={busy || !user?.imageUrl}
                className={cx(
                  "mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm",
                  "transition hover:bg-rose-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                  "dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
                )}
              >
                Remove photo
              </button>
            </div>
          </div>

          {/* Tips card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tips</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Small improvements that help a lot.
              </p>
            </div>

            <div className="px-6 py-5">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  Keep your email current so admins can reach you.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  Use a strong password (8+ characters).
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  Upload a clear profile photo for quick recognition.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (dashboard-style subtle) */}
      <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        © {new Date().getFullYear()} Virtual Office. All rights reserved.
      </div>
    </div>
  );
}
