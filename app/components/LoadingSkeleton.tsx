"use client";

import { motion } from "framer-motion";
import type { LoadingSkeletonProps } from "@/app/types";

export default function LoadingSkeleton({
  message = "Mempersiapkan kamera...",
}: LoadingSkeletonProps) {
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4"
      style={{ background: "#111" }}
    >
      {/* Lens shimmer placeholder */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden"
        style={{ background: "#1c1c1e", boxShadow: "0 0 0 4px #2a2a2c, 0 0 0 6px #1c1c1e" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full" style={{ background: "#0d0d0d" }} />
        </div>
      </div>

      {/* Spinner ring */}
      <motion.div
        className="w-6 h-6 rounded-full border-2"
        style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "rgba(255,255,255,0.5)" }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
      />

      <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>{message}</p>
    </div>
  );
}
