/**
 * GestureDetector.ts
 *
 * Re-exports gesture detection utilities for use in components.
 * This acts as a thin façade over the gesture utils and mediapipe lib.
 */

export { isPeaceGesture, detectPeaceInHands } from "@/app/utils/gesture";
export { createHandLandmarker, detectHands, destroyHandLandmarker } from "@/app/lib/mediapipe";
