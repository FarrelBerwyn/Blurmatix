"use client";

import Camera from "@/app/components/Camera";

export default function PhotoPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      <Camera />
    </main>
  );
}
