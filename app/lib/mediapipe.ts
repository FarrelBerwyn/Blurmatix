import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

// ── Use local WASM from node_modules (served via /wasm/ by Next.js) ──────────
// This avoids CDN blocks, COEP/CORP issues, and version mismatches.
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let instance: HandLandmarker | null = null;
let initPromise: Promise<HandLandmarker> | null = null;

export async function createHandLandmarker(): Promise<HandLandmarker> {
  if (instance) return instance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    console.log("[MediaPipe] Loading FilesetResolver from:", WASM_PATH);

    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    console.log("[MediaPipe] FilesetResolver OK, loading HandLandmarker model...");

    // Try GPU first, fall back to CPU
    for (const delegate of ["GPU", "CPU"] as const) {
      try {
        const lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.4,
        });
        console.log(`[MediaPipe] HandLandmarker ready (delegate: ${delegate})`);
        instance = lm;
        return lm;
      } catch (e) {
        console.warn(`[MediaPipe] delegate=${delegate} failed:`, e);
      }
    }

    throw new Error("HandLandmarker: both GPU and CPU delegates failed");
  })();

  try {
    return await initPromise;
  } catch (e) {
    initPromise = null;
    throw e;
  }
}

export function destroyHandLandmarker(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
  initPromise = null;
}

export function detectHands(
  landmarker: HandLandmarker,
  video: HTMLVideoElement,
  timestampMs: number
): HandLandmarkerResult {
  return landmarker.detectForVideo(video, timestampMs);
}
