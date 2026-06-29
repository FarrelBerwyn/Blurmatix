"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { createHandLandmarker, detectHands, destroyHandLandmarker } from "@/app/lib/mediapipe";
import { detectPeaceInHands } from "@/app/utils/gesture";
import type { HandDetectionState } from "@/app/types";

interface UseHandDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  onPeaceChange?: (isPeace: boolean) => void;
}

interface UseHandDetectionReturn extends HandDetectionState {
  initModel: () => Promise<void>;
  stopDetection: () => void;
  debugInfo: string;
}

const PEACE_ACTIVATE_MS   = 100;
const PEACE_DEACTIVATE_MS = 250;

export function useHandDetection({ videoRef, enabled, onPeaceChange }: UseHandDetectionOptions): UseHandDetectionReturn {
  const [state, setState] = useState<HandDetectionState>({
    handsDetected: 0,
    isPeace: false,
    blurActive: false,
    loadingModel: false,
    modelError: null,
    fps: 0,
  });

  const landmarkerRef   = useRef<HandLandmarker | null>(null);
  const rafRef          = useRef<number>(0);
  const runningRef      = useRef(false);
  const enabledRef      = useRef(enabled);
  const debugRef        = useRef("Initializing...");

  // Debounce
  const peaceRef        = useRef(false);       // current committed state
  const activateTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deactivateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FPS
  const fpsRef = useRef({ frames: 0, last: performance.now() });

  // Keep enabledRef in sync
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // ── Debounced peace setter ─────────────────────────────────────────────────
  const setPeace = useCallback((next: boolean) => {
    if (next === peaceRef.current) return;

    if (next) {
      if (deactivateTimer.current) { clearTimeout(deactivateTimer.current); deactivateTimer.current = null; }
      if (!activateTimer.current) {
        activateTimer.current = setTimeout(() => {
          activateTimer.current = null;
          peaceRef.current = true;
          setState(p => ({ ...p, isPeace: true, blurActive: true }));
          onPeaceChange?.(true);
        }, PEACE_ACTIVATE_MS);
      }
    } else {
      if (activateTimer.current) { clearTimeout(activateTimer.current); activateTimer.current = null; }
      if (!deactivateTimer.current) {
        deactivateTimer.current = setTimeout(() => {
          deactivateTimer.current = null;
          peaceRef.current = false;
          setState(p => ({ ...p, isPeace: false, blurActive: false }));
          onPeaceChange?.(false);
        }, PEACE_DEACTIVATE_MS);
      }
    }
  }, [onPeaceChange]);

  // ── Detection loop ─────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    if (!runningRef.current) return;

    const video    = videoRef.current;
    const detector = landmarkerRef.current;

    if (!video || !detector || video.readyState < 2 || video.paused || video.ended) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    try {
      const result     = detector.detectForVideo(video, performance.now());
      const handCount  = result.landmarks?.length ?? 0;
      const peace      = detectPeaceInHands(result.landmarks ?? []);

      setState(p => ({ ...p, handsDetected: handCount }));
      setPeace(peace);

      // Build debug string from first hand landmarks
      if (handCount > 0) {
        const lm = result.landmarks[0];
        const w = lm[0];
        const i_tip = lm[8]; const i_mcp = lm[5];
        const m_tip = lm[12]; const m_mcp = lm[9];
        const r_tip = lm[16]; const r_mcp = lm[13];
        const p_tip = lm[20]; const p_mcp = lm[17];
        const dw = (a: typeof lm[0], b: typeof lm[0]) =>
          Math.hypot(a.x - b.x, a.y - b.y).toFixed(3);
        debugRef.current = [
          `Hands: ${handCount}`,
          `Index:  tip=${dw(i_tip,w)} mcp=${dw(i_mcp,w)} ext=${parseFloat(dw(i_tip,w)) > parseFloat(dw(i_mcp,w))*1.15 ? "✓" : "✗"}`,
          `Middle: tip=${dw(m_tip,w)} mcp=${dw(m_mcp,w)} ext=${parseFloat(dw(m_tip,w)) > parseFloat(dw(m_mcp,w))*1.15 ? "✓" : "✗"}`,
          `Ring:   tip=${dw(r_tip,w)} mcp=${dw(r_mcp,w)} curl=${parseFloat(dw(r_tip,w)) < parseFloat(dw(r_mcp,w))*1.0 ? "✓" : "✗"}`,
          `Pinky:  tip=${dw(p_tip,w)} mcp=${dw(p_mcp,w)} curl=${parseFloat(dw(p_tip,w)) < parseFloat(dw(p_mcp,w))*1.0 ? "✓" : "✗"}`,
          `Peace: ${peace ? "YES ✌️" : "no"}`,
        ].join("\n");
      } else {
        debugRef.current = "No hands detected";
      }

      // FPS
      fpsRef.current.frames++;
      const now     = performance.now();
      const elapsed = now - fpsRef.current.last;
      if (elapsed >= 1000) {
        const fps = Math.round(fpsRef.current.frames * 1000 / elapsed);
        fpsRef.current = { frames: 0, last: now };
        setState(p => ({ ...p, fps }));
      }
    } catch (e) {
      console.warn("[Detection loop]", e);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [videoRef, setPeace]);

  // ── Start loop helper ──────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    if (!landmarkerRef.current) return;
    console.log("[Detection] Starting loop");
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    if (activateTimer.current)   { clearTimeout(activateTimer.current);   activateTimer.current = null; }
    if (deactivateTimer.current) { clearTimeout(deactivateTimer.current); deactivateTimer.current = null; }
  }, []);

  // ── Init model ─────────────────────────────────────────────────────────────
  const initModel = useCallback(async () => {
    if (landmarkerRef.current) {
      // Model already loaded — just make sure loop is running if enabled
      if (enabledRef.current) startLoop();
      return;
    }

    setState(p => ({ ...p, loadingModel: true, modelError: null }));

    try {
      const lm = await createHandLandmarker();
      landmarkerRef.current = lm;
      setState(p => ({ ...p, loadingModel: false }));
      console.log("[Detection] Model loaded, enabled=", enabledRef.current);
      // Start loop immediately — don't wait for next render cycle
      if (enabledRef.current) startLoop();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Detection] Model load error:", msg);
      setState(p => ({ ...p, loadingModel: false, modelError: msg }));
    }
  }, [startLoop]);

  // ── React to enabled changes ───────────────────────────────────────────────
  useEffect(() => {
    if (enabled && landmarkerRef.current) {
      startLoop();
    } else if (!enabled) {
      stopLoop();
    }
    return stopLoop;
  }, [enabled, startLoop, stopLoop]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopLoop();
      destroyHandLandmarker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, initModel, stopDetection: stopLoop, debugInfo: debugRef.current };
}
