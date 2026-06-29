"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GestureStatusProps } from "@/app/types";

/**
 * Gesture status pill — rendered inline, positioned by parent.
 */
export default function GestureStatus({ isPeace, handsDetected }: GestureStatusProps) {
  return (
    <AnimatePresence mode="wait">
      {isPeace ? (
        <motion.div
          key="peace"
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(48,209,88,0.25)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[12px] font-medium whitespace-nowrap" style={{ color: "rgba(48,209,88,1)" }}>
            ✌️ Peace Detected
          </span>
        </motion.div>
      ) : (
        <motion.div
          key="looking"
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.25)" }} />
          <span className="text-[12px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.4)" }}>
            {handsDetected > 0
              ? `${handsDetected} tangan terdeteksi`
              : "Arahkan gesture ✌️ ke kamera"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
