"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function upload() {
    setMsg("");
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/user/profile/photo", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMsg(data.error || "Upload failed");
      return;
    }
    setMsg("Uploaded successfully");
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button className="bg-black text-white px-4 py-2 rounded" onClick={upload}>
        Upload Photo
      </button>

      {msg ? <div className="text-sm">{msg}</div> : null}
    </div>
  );
}
