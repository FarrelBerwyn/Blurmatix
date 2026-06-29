import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5,  INDEX_PIP: 6,  INDEX_DIP: 7,  INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13,  RING_PIP: 14,  RING_DIP: 15,  RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
} as const;

function d(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * A finger is EXTENDED when its tip is farther from the wrist
 * than its MCP (knuckle). Ratio > 1.0 = extended.
 * We use 1.15 for a bit of tolerance.
 */
function extended(lm: NormalizedLandmark[], tip: number, mcp: number): boolean {
  return d(lm[tip], lm[0]) > d(lm[mcp], lm[0]) * 1.15;
}

/**
 * A finger is CURLED when its tip is closer to the wrist than its MCP.
 */
function curled(lm: NormalizedLandmark[], tip: number, mcp: number): boolean {
  return d(lm[tip], lm[0]) < d(lm[mcp], lm[0]) * 1.0;
}

/**
 * Peace / Victory ✌️
 * Index + Middle: extended
 * Ring  + Pinky:  curled
 * Thumb:          don't care
 */
export function isPeaceGesture(lm: NormalizedLandmark[]): boolean {
  if (!lm || lm.length < 21) return false;

  const ok = (
    extended(lm, 8,  5)  &&   // index extended
    extended(lm, 12, 9)  &&   // middle extended
    curled  (lm, 16, 13) &&   // ring curled
    curled  (lm, 20, 17)      // pinky curled
  );

  if (ok) console.log("[Gesture] PEACE detected ✌️");
  return ok;
}

export function detectPeaceInHands(hands: NormalizedLandmark[][]): boolean {
  return hands?.some(isPeaceGesture) ?? false;
}
