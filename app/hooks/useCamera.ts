"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { CameraState } from "@/app/types";

interface UseCameraOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

interface UseCameraReturn extends CameraState {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera({ videoRef }: UseCameraOptions): UseCameraReturn {
  const [state, setState] = useState<CameraState>({
    cameraReady: false,
    permissionGranted: null,
    permissionError: null,
    stream: null,
  });

  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      permissionError: null,
      cameraReady: false,
    }));

    try {
      // Prefer front-facing camera (selfie)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 60, max: 60 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          video.onloadedmetadata = () => {
            video
              .play()
              .then(() => resolve())
              .catch(reject);
          };
          video.onerror = () => reject(new Error("Video element error"));
        });

        setState({
          cameraReady: true,
          permissionGranted: true,
          permissionError: null,
          stream,
        });
      }
    } catch (error) {
      const err = error as DOMException | Error;
      let message = "Terjadi kesalahan saat mengakses kamera.";

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Izin kamera ditolak oleh pengguna.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "Kamera tidak ditemukan di perangkat ini.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        message = "Kamera sedang digunakan oleh aplikasi lain.";
      } else if (err.name === "OverconstrainedError") {
        message = "Pengaturan kamera tidak kompatibel.";
      }

      setState((prev) => ({
        ...prev,
        cameraReady: false,
        permissionGranted: false,
        permissionError: message,
        stream: null,
      }));
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState({
      cameraReady: false,
      permissionGranted: null,
      permissionError: null,
      stream: null,
    });
  }, [videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    ...state,
    startCamera,
    stopCamera,
  };
}
