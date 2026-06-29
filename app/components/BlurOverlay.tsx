"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlurOverlayProps } from "@/app/types";

/**
 * BlurOverlay renders a blurred duplicate of the video
 * on top of the original feed using CSS filter blur.
 *
 * Animates in/out with opacity + scale + blur transitions.
 */
export default function BlurOverlay({ isBlurred, showFlash }: BlurOverlayProps) {
  const audioRef = useRef<AudioContext | null>(null);

  // Play shutter click sound when blur activates
  useEffect(() => {
    if (!isBlurred) return;

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioRef.current = ctx;

      // Synthesize a quick shutter-like click
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);

      oscillator.onended = () => {
        ctx.close();
        audioRef.current = null;
      };
    } catch {
      // Audio not supported or blocked — silently skip
    }
  }, [isBlurred]);

  return (
    <>
      {/* ── Blur Layer ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBlurred && (
          <motion.div
            key="blur-overlay"
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              backdropFilter: "blur(var(--blur-amount))",
              WebkitBackdropFilter: "blur(var(--blur-amount))",
              // Fallback for browsers that don't support backdrop-filter
              background: "rgba(0,0,0,0.01)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Dark Overlay ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBlurred && (
          <motion.div
            key="dark-overlay"
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ background: "var(--blur-overlay-color)" }}
          />
        )}
      </AnimatePresence>

      {/* ── White Flash (on blur activation) ─────────────────────────── */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="absolute inset-0 z-20 pointer-events-none bg-white"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
