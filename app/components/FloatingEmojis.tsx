"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmojiParticle {
  id: number;
  /** spawn x offset from anchor (px, random spread) */
  spawnX: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  emoji: string;
}

export interface FloatingEmojisProps {
  active: boolean;
  /**
   * Anchor point for spawn origin (bottom-left of the emitter).
   * Defaults to bottom-left corner of the container.
   * Pass pixel values from the parent's coordinate system.
   */
  anchorLeft?: number;
  anchorBottom?: number;
  /** Spread width around the anchor (px). Default 80. */
  spread?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJIS = ["❤️", "🩷", "💕", "💗", "💓", "💖", "💝"];
const BATCH_SIZE     = 3;
const BATCH_INTERVAL = 550;
const MAX_PARTICLES  = 25;

let uid = 0;
const nextId = () => ++uid;

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawnBatch(spread: number): EmojiParticle[] {
  return Array.from({ length: BATCH_SIZE }, () => ({
    id: nextId(),
    spawnX: rnd(-spread * 0.3, spread),   // cluster slightly to the right of anchor
    size: rnd(22, 38),
    drift: rnd(-30, 50),
    duration: rnd(1800, 2800),
    delay: rnd(0, 280),
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingEmojis({
  active,
  anchorLeft = 16,
  anchorBottom = 16,
  spread = 80,
}: FloatingEmojisProps) {
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      // Spawn first batch immediately
      setParticles(prev => [...prev, ...spawnBatch(spread)].slice(-MAX_PARTICLES));

      timerRef.current = setInterval(() => {
        setParticles(prev => [...prev, ...spawnBatch(spread)].slice(-MAX_PARTICLES));
      }, BATCH_INTERVAL);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [active, spread]);

  const remove = (id: number) =>
    setParticles(prev => prev.filter(p => p.id !== id));

  return (
    // Positioned absolutely relative to the nearest positioned ancestor (the whole Camera div)
    // z-50 → always on top of everything including blur overlay and HUD
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 50 }}>
      <AnimatePresence>
        {particles.map(p => (
          <Particle
            key={p.id}
            particle={p}
            anchorLeft={anchorLeft}
            anchorBottom={anchorBottom}
            onDone={() => remove(p.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Single Particle ──────────────────────────────────────────────────────────

interface ParticleProps {
  particle: EmojiParticle;
  anchorLeft: number;
  anchorBottom: number;
  onDone: () => void;
}

function Particle({ particle, anchorLeft, anchorBottom, onDone }: ParticleProps) {
  const { spawnX, size, drift, duration, delay, emoji } = particle;
  const riseY = -rnd(260, 460);

  return (
    <motion.div
      aria-hidden="true"
      className="absolute select-none"
      style={{
        left: anchorLeft + spawnX,
        bottom: anchorBottom,
        fontSize: size,
        lineHeight: 1,
        width: size + 8,
        textAlign: "center",
        willChange: "transform, opacity",
      }}
      initial={{ y: 0, x: 0, opacity: 0, scale: 0.3, rotate: rnd(-20, 20) }}
      animate={{
        y: riseY,
        x: drift,
        opacity: [0, 1, 1, 0],
        scale: [0.3, 1.15, 1.0, 0.7],
        rotate: rnd(-25, 25),
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.22, 0.61, 0.36, 1],
        opacity: { times: [0, 0.12, 0.72, 1], duration: duration / 1000, delay: delay / 1000 },
        scale:   { times: [0, 0.18, 0.65, 1], duration: duration / 1000, delay: delay / 1000 },
      }}
      onAnimationComplete={onDone}
    >
      {emoji}
    </motion.div>
  );
}
