import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// ─── Camera State ────────────────────────────────────────────────────────────

export interface CameraState {
  cameraReady: boolean;
  permissionGranted: boolean | null;
  permissionError: string | null;
  stream: MediaStream | null;
}

// ─── Hand Detection State ─────────────────────────────────────────────────────

export interface HandDetectionState {
  handsDetected: number;
  isPeace: boolean;
  blurActive: boolean;
  loadingModel: boolean;
  modelError: string | null;
  fps: number;
}

// ─── Gesture Types ────────────────────────────────────────────────────────────

export type HandLandmarks = NormalizedLandmark[];

export interface GestureResult {
  isPeace: boolean;
  handCount: number;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface BlurOverlayProps {
  isBlurred: boolean;
  showFlash: boolean;
}

export interface FPSCounterProps {
  fps: number;
}

export interface GestureStatusProps {
  isPeace: boolean;
  handsDetected: number;
}

export interface LoadingSkeletonProps {
  message?: string;
}
