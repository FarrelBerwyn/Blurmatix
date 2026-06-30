"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "@/app/hooks/useCamera";
import { useHandDetection } from "@/app/hooks/useHandDetection";
import BlurOverlay from "./BlurOverlay";
import FPSCounter from "./FPSCounter";
import GestureStatus from "./GestureStatus";
import LoadingSkeleton from "./LoadingSkeleton";
import FloatingEmojis from "./FloatingEmojis";

// ─── Filmstrip thumbnail data ─────────────────────────────────────────────────
interface Thumbnail {
  id: number;
  dataUrl: string;
}

const MAX_THUMBS = 6;
const PHOTOSTRIP_COUNT = 3;

export default function Camera() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showFlash, setShowFlash] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumb, setSelectedThumb] = useState<string | null>(null);
  const [shutterPressed, setShutterPressed] = useState(false);
  const [photostripReady, setPhotostripReady] = useState(false);
  const prevBlurRef = useRef(false);
  const thumbIdRef = useRef(0);

  const { cameraReady, permissionGranted, permissionError, startCamera } =
    useCamera({ videoRef });

  const { handsDetected, isPeace, blurActive, loadingModel, modelError, fps, initModel, debugInfo } =
    useHandDetection({ videoRef, enabled: cameraReady });

  // White flash + snapshot on blur activation
  useEffect(() => {
    if (blurActive && !prevBlurRef.current) {
      setShowFlash(true);
      captureSnapshot();
      setTimeout(() => setShowFlash(false), 500);
      prevBlurRef.current = true;
    }
    if (!blurActive) prevBlurRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blurActive]);

  // Init camera + model
  useEffect(() => {
    startCamera();
    initModel();
  }, [startCamera, initModel]);

  // Save photos to localStorage when we have 3+ and navigate back
  useEffect(() => {
    if (thumbnails.length >= PHOTOSTRIP_COUNT && !photostripReady) {
      setPhotostripReady(true);
      // Save the latest 3 photos to localStorage
      const latestPhotos = thumbnails.slice(-PHOTOSTRIP_COUNT).map((t) => t.dataUrl);
      localStorage.setItem("blurmatix-photostrip", JSON.stringify(latestPhotos));
    }
  }, [thumbnails, photostripReady]);

  /** Grab a frame from the video and add to filmstrip */
  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw mirrored frame
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    const id = ++thumbIdRef.current;

    setThumbnails((prev) => {
      const next = [...prev, { id, dataUrl }];
      return next.length > MAX_THUMBS ? next.slice(-MAX_THUMBS) : next;
    });
  }, []);

  /** Shutter button — manual capture */
  const handleShutter = useCallback(() => {
    setShutterPressed(true);
    setShowFlash(true);
    captureSnapshot();
    setTimeout(() => {
      setShutterPressed(false);
      setShowFlash(false);
    }, 300);
  }, [captureSnapshot]);

  const handleRetry = useCallback(() => {
    startCamera();
    initModel();
  }, [startCamera, initModel]);

  /** Back button — navigate to home */
  const handleBack = useCallback(() => {
    // Stop camera stream before navigating
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push("/");
  }, [router]);

  /** Finish & go home with photostrip */
  const handleFinish = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push("/");
  }, [router]);

  // ── Error screens ────────────────────────────────────────────────────────────
  if (permissionGranted === false && permissionError) {
    return <ErrorScreen icon="📷" title="Izin Kamera Diperlukan" message={permissionError} onRetry={handleRetry} />;
  }
  if (modelError) {
    return <ErrorScreen icon="🤖" title="Gagal Memuat AI" message={modelError} onRetry={handleRetry} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col"
      style={{ background: "#111" }}
    >
      {/* ── Top window bar (Mac title bar feel) ────────────────────────── */}
      <div
        className="flex-none flex items-center justify-between px-4 h-10 select-none"
        style={{
          background: "linear-gradient(180deg, #2e2e30 0%, #222224 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Traffic light dots — red is back button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="w-3 h-3 rounded-full flex items-center justify-center group relative"
            style={{ background: "#e5342a", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }}
            aria-label="Kembali"
          >
            <svg
              className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 8 8"
              fill="none"
            >
              <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="rgba(0,0,0,0.7)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="w-3 h-3 rounded-full" style={{ background: "#f5a623", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#30d158", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
        </div>
        {/* App name */}
        <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
          Blurmatix
        </span>
        <div className="w-16" />
      </div>

      {/* ── Main viewport + filmstrip ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0" style={{ background: "#0d0d0d" }}>

        {/* Video viewport */}
        <div className="flex-1 relative min-h-0 flex items-center justify-center p-4 pb-0">
          {/* Bezel frame */}
          <div
            className="pb-bezel relative w-full h-full rounded-xl overflow-hidden"
            style={{ maxHeight: "calc(100vh - 200px)", background: "#000" }}
          >
            {/* Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover camera-mirror"
              aria-label="Camera feed"
            />

            {/* Blur overlay */}
            <BlurOverlay isBlurred={blurActive} showFlash={showFlash} />

            {/* Loading skeleton */}
            <AnimatePresence>
              {(!cameraReady || loadingModel) && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <LoadingSkeleton message={loadingModel ? "Memuat model AI..." : "Menghubungkan kamera..."} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* HUD: FPS + gesture status + badge */}
            <AnimatePresence>
              {cameraReady && !loadingModel && (
                <motion.div
                  key="hud"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <FPSCounter fps={fps} />

                  {/* Blur badge top-right */}
                  <AnimatePresence>
                    {blurActive && (
                      <motion.div
                        key="blur-badge"
                        initial={{ opacity: 0, scale: 0.85, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: "rgba(0,0,0,0.6)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(229,52,42,0.3)",
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span className="text-[11px] font-semibold text-red-400 tracking-wide uppercase">
                          Blur Aktif
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hint badge */}
                  <HintBadge />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Corner vignette */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            />
          </div>
        </div>

      {/* ── Floating love emojis — page-level, always on top ────────── */}
      <FloatingEmojis
        active={blurActive}
        anchorLeft={24}
        anchorBottom={76 + 72 + 8}
        spread={90}
      />

      {/* ── Gesture status — bottom-left above toolbar ───────────────── */}
      <div className="absolute left-6 pointer-events-none" style={{ bottom: 76 + 72 + 10, zIndex: 49 }}>
        <GestureStatus isPeace={isPeace} handsDetected={handsDetected} />
      </div>

      {/* ── Filmstrip ─────────────────────────────────────────────────── */}
        <div
          className="flex-none flex items-center justify-center gap-2 px-4 py-2"
          style={{ height: 72 }}
        >
          {thumbnails.length === 0 ? (
            /* Empty placeholder slots */
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-md flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              />
            ))
          ) : (
            thumbnails.map((t) => (
              <motion.button
                key={t.id}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setSelectedThumb(t.dataUrl)}
                className="pb-thumb rounded-md overflow-hidden flex-shrink-0 relative"
                style={{ width: 52, height: 52 }}
                aria-label="Lihat foto"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.dataUrl} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div
        className="pb-toolbar flex-none flex items-center justify-between px-6"
        style={{ height: 76 }}
      >
        {/* Left: effects placeholder */}
        <div className="flex items-center gap-3 w-24">
          <ToolbarBtn icon="🌫️" label="Effects" active={blurActive} />
        </div>

        {/* Center: shutter button */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="pb-shutter"
            onClick={handleShutter}
            disabled={!cameraReady || shutterPressed}
            aria-label="Take photo"
            style={{ opacity: !cameraReady ? 0.4 : 1 }}
          />
          {/* Photo counter */}
          {thumbnails.length > 0 && (
            <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
              {thumbnails.length} / {PHOTOSTRIP_COUNT}
            </span>
          )}
        </div>

        {/* Right: finish button or gesture indicator */}
        <div className="flex items-center justify-end gap-2 w-24">
          {photostripReady ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide"
              style={{
                background: "linear-gradient(180deg, #30d158 0%, #28a745 100%)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 8px rgba(48,209,88,0.4)",
              }}
            >
              Selesai
            </motion.button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isPeace ? "#30d158" : "rgba(255,255,255,0.2)" }}
              />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                ✌️
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedThumb && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-8"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
            onClick={() => setSelectedThumb(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="relative rounded-xl overflow-hidden"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedThumb} alt="Snapshot" className="block max-w-full max-h-[80vh] object-contain" />
              <button
                onClick={() => setSelectedThumb(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
                aria-label="Tutup"
              >
                ✕
              </button>
              {/* Download button */}
              <a
                href={selectedThumb}
                download="blurmatix-photo.jpg"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white"
                style={{ background: "rgba(229,52,42,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Simpan
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Toolbar icon button ───────────────────────────────────────────────────────
function ToolbarBtn({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
        style={{
          background: active ? "rgba(229,52,42,0.18)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${active ? "rgba(229,52,42,0.35)" : "rgba(255,255,255,0.08)"}`,
          transition: "all 200ms",
        }}
      >
        {icon}
      </div>
      <span className="text-[9px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Hint badge ───────────────────────────────────────────────────────────────
function HintBadge() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hint"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full whitespace-nowrap text-[12px]"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          ✌️ Tunjuk gesture Peace untuk blur
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Error screen ──────────────────────────────────────────────────────────────
function ErrorScreen({
  icon, title, message, onRetry,
}: {
  icon: string; title: string; message: string; onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 p-8 text-center"
      style={{ background: "#111" }}
    >
      <div className="text-5xl">{icon}</div>
      <div>
        <h2 className="text-[17px] font-semibold mb-1.5" style={{ color: "#f2f2f7" }}>{title}</h2>
        <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{message}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="px-6 py-2.5 rounded-[8px] text-[14px] font-medium text-white"
        style={{
          background: "linear-gradient(180deg, #e5342a 0%, #c42b22 100%)",
          boxShadow: "0 2px 8px rgba(229,52,42,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          border: "1px solid rgba(0,0,0,0.3)",
        }}
      >
        Coba Lagi
      </motion.button>
    </motion.div>
  );
}
