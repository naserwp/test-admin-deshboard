import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Office Documents",
  description: "Virtual Office Management for secure document workflows."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
