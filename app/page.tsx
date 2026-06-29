"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Camera from "@/app/components/Camera";

export default function Home() {
  const [cameraStarted, setCameraStarted] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* ── Landing Screen ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {!cameraStarted && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "#0a0a0a" }}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(229,52,42,0.07) 0%, transparent 70%)",
              }}
            />

            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
              className="relative flex flex-col items-center gap-7 px-8 text-center"
            >
              {/* App icon — camera lens style */}
              <div className="relative w-24 h-24 rounded-[28px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #2a2a2c, #111)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {/* Outer lens ring */}
                <div className="absolute inset-3 rounded-full"
                  style={{ background: "linear-gradient(135deg, #3a3a3c, #1c1c1e)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)" }}
                />
                {/* Inner lens */}
                <div className="absolute inset-5 rounded-full flex items-center justify-center"
                  style={{ background: "radial-gradient(circle at 40% 35%, #4a4a4c, #0d0d0d)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)" }}
                >
                  <span className="text-2xl select-none" aria-hidden>📷</span>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <h1 className="text-[2.6rem] font-semibold tracking-tight leading-none" style={{ color: "#f2f2f7" }}>
                  Foto Kita Blur
                </h1>
                <p className="text-[15px] leading-relaxed max-w-[300px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Tunjukkan gesture <span style={{ color: "rgba(255,255,255,0.85)" }}>Peace ✌️</span> di depan kamera dan saksikan efek blur otomatis aktif.
                </p>
              </div>

              {/* Steps row */}
              <div className="flex items-center gap-3 text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                <StepItem icon="📷" label="Buka kamera" />
                <ChevronRight />
                <StepItem icon="✌️" label="Gesture Peace" />
                <ChevronRight />
                <StepItem icon="🌫️" label="Foto blur!" />
              </div>

              {/* Open Camera button — Mac style */}
              <motion.button
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.975 }}
                onClick={() => setCameraStarted(true)}
                className="relative px-9 py-3 rounded-[10px] text-[15px] font-medium overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #e5342a 0%, #c42b22 100%)",
                  color: "#fff",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 14px rgba(229,52,42,0.5), 0 1px 3px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(0,0,0,0.3)",
                }}
              >
                Open Camera
              </motion.button>

              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                Video tidak direkam atau disimpan
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera View ────────────────────────────────────────────────── */}
      {cameraStarted && <Camera />}
    </main>
  );
}

function StepItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.25, flexShrink: 0 }}>
      <path d="M4 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
