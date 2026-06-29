"use client";

import type { FPSCounterProps } from "@/app/types";

export default function FPSCounter({ fps }: FPSCounterProps) {
  const color =
    fps >= 50 ? "rgba(48,209,88,0.9)" : fps >= 30 ? "rgba(255,214,10,0.9)" : "rgba(255,69,58,0.9)";

  return (
    <div
      className="fps-counter absolute top-3 left-3 z-30 px-2 py-1 rounded-md select-none"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        color,
      }}
      aria-label={`FPS: ${fps}`}
    >
      {fps} FPS
    </div>
  );
}
