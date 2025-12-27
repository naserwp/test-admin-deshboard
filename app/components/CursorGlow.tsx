"use client";

import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden
    >
      <div
        className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/20 blur-3xl transition-transform duration-200"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
      <div
        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/10 shadow-[0_0_25px_8px_rgba(56,189,248,0.35)] backdrop-blur-sm transition-transform duration-150 dark:bg-white/10"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  );
}
