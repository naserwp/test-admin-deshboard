import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

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
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
        {/* Subtle animated background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl"
            style={{ animation: "floaty 14s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl"
            style={{ animation: "floaty 18s ease-in-out infinite" }}
          />
          <div
            className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl"
            style={{ animation: "floaty 22s ease-in-out infinite" }}
          />
        </div>

        <div className="min-h-screen">{children}</div>

        {/* Global Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              background: "#0f172a", // slate-900
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />

        {/* Local keyframes (no extra css file needed) */}
        <style>{`
          @keyframes floaty {
            0%   { transform: translate3d(0, 0, 0) scale(1); }
            50%  { transform: translate3d(0, -18px, 0) scale(1.03); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
        `}</style>
      </body>
    </html>
  );
}
