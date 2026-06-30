"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const basePath = process.env.NODE_ENV === "production" ? "/Blurmatix" : "";

export default function Home() {
  const router = useRouter();
  const [photostripImages, setPhotostripImages] = useState<string[]>([]);
  const [showPhotostrip, setShowPhotostrip] = useState(false);
  const [photostripDataUrl, setPhotostripDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check localStorage for photostrip photos on mount
  useEffect(() => {
    const stored = localStorage.getItem("blurmatix-photostrip");
    if (stored) {
      try {
        const photos = JSON.parse(stored) as string[];
        if (photos.length >= 3) {
          setPhotostripImages(photos);
          // Small delay for entrance animation, then show strip
          setTimeout(() => setShowPhotostrip(true), 600);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Generate photostrip canvas when images are available
  useEffect(() => {
    if (photostripImages.length < 3 || !showPhotostrip) return;

    const generatePhotostrip = async () => {
      const STRIP_W = 320;
      const PHOTO_H = 210;
      const PAD = 16;
      const GAP = 12;
      const HEADER_H = 60;
      const FOOTER_H = 50;
      const STRIP_H = HEADER_H + (PHOTO_H + GAP) * 3 - GAP + PAD * 2 + FOOTER_H;

      const canvas = document.createElement("canvas");
      canvas.width = STRIP_W;
      canvas.height = STRIP_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = "#f5f0eb";
      ctx.beginPath();
      const r = 12;
      ctx.moveTo(r, 0);
      ctx.lineTo(STRIP_W - r, 0);
      ctx.quadraticCurveTo(STRIP_W, 0, STRIP_W, r);
      ctx.lineTo(STRIP_W, STRIP_H - r);
      ctx.quadraticCurveTo(STRIP_W, STRIP_H, STRIP_W - r, STRIP_H);
      ctx.lineTo(r, STRIP_H);
      ctx.quadraticCurveTo(0, STRIP_H, 0, STRIP_H - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.fill();

      // Header
      ctx.fillStyle = "#1a2332";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BLURMATIX", STRIP_W / 2, 32);
      ctx.fillStyle = "#8a9bb0";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("PHOTOBOOTH", STRIP_W / 2, 48);

      // Load and draw photos
      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        });

      for (let i = 0; i < 3; i++) {
        const img = await loadImage(photostripImages[i]);
        const x = PAD;
        const y = HEADER_H + i * (PHOTO_H + GAP);
        const w = STRIP_W - PAD * 2;

        // Photo frame shadow
        ctx.shadowColor = "rgba(0,0,0,0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, w, PHOTO_H);
        ctx.shadowColor = "transparent";

        // Draw photo
        const imgAspect = img.width / img.height;
        const frameAspect = w / PHOTO_H;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgAspect > frameAspect) {
          sw = img.height * frameAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / frameAspect;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, x + 2, y + 2, w - 4, PHOTO_H - 4);

        // Photo border
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, PHOTO_H);
      }

      // Footer
      const footerY = STRIP_H - FOOTER_H + 12;
      ctx.fillStyle = "#b0a89e";
      ctx.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      ctx.fillText(date, STRIP_W / 2, footerY);
      ctx.fillText("✌️ Peace Gesture Blur", STRIP_W / 2, footerY + 14);

      setPhotostripDataUrl(canvas.toDataURL("image/jpeg", 0.95));
    };

    generatePhotostrip();
  }, [photostripImages, showPhotostrip]);

  const handleStartPhoto = () => {
    // Clear previous photostrip
    localStorage.removeItem("blurmatix-photostrip");
    setPhotostripImages([]);
    setShowPhotostrip(false);
    setPhotostripDataUrl(null);
    router.push("/photo");
  };

  const handleDownloadStrip = useCallback(() => {
    if (!photostripDataUrl) return;
    const a = document.createElement("a");
    a.href = photostripDataUrl;
    a.download = "blurmatix-photostrip.jpg";
    a.click();
  }, [photostripDataUrl]);

  const handleClearStrip = useCallback(() => {
    localStorage.removeItem("blurmatix-photostrip");
    setShowPhotostrip(false);
    setPhotostripImages([]);
    setPhotostripDataUrl(null);
  }, []);

  return (
    <main className="booth-fullscreen">
      {/* ── Photobooth Machine ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="booth-machine"
      >
        {/* ── Left Panel — Branding ──────────────────────────────────── */}
        <div className="booth-left-panel">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="booth-logo-area"
          >
            {/* B Logo Mark */}
            <div className="booth-logo-mark">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8h16c4.418 0 8 3.582 8 8 0 2.761-1.397 5.193-3.525 6.632C35.262 24.207 38 27.314 38 31c0 4.97-4.03 9-9 9H12V8z" fill="none" stroke="white" strokeWidth="2.5"/>
                <path d="M18 14h8c2.209 0 4 1.791 4 4s-1.791 4-4 4h-8v-8z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
                <path d="M18 26h10c2.761 0 5 2.239 5 5s-2.239 5-5 5H18v-10z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>

            {/* Brand Text */}
            <div className="booth-brand-text">
              <h1 className="booth-brand-name">Blurmatix</h1>
              <p className="booth-brand-sub">PHOTOBOOTH</p>
            </div>
          </motion.div>
        </div>

        {/* ── Center — Curtain Area ──────────────────────────────────── */}
        <div className="booth-center-area">
          <div className="booth-curtain-frame">
            <div className="booth-curtain-topbar" />
            <div className="booth-curtain-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${basePath}/NavyCurtain.jpg`}
                alt="Photobooth curtain"
                className="booth-curtain-photo"
              />
              <div className="booth-curtain-overlay" />
            </div>
          </div>
        </div>

        {/* ── Right Panel — Controls ─────────────────────────────────── */}
        <div className="booth-right-panel">
          {/* START PHOTO Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartPhoto}
            className="booth-start-btn"
          >
            <svg className="booth-start-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="32" height="24" rx="4" stroke="white" strokeWidth="2.2" fill="none"/>
              <circle cx="20" cy="22" r="7" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="22" r="3.5" fill="rgba(255,255,255,0.3)"/>
              <rect x="15" y="7" width="10" height="4" rx="1.5" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
            <span className="booth-start-text">START PHOTO</span>
          </motion.button>

          {/* Photostrip Icon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="booth-photostrip-area"
          >
            <svg className="booth-photostrip-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="2" width="20" height="32" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
              <rect x="11" y="5" width="14" height="8" rx="1" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <rect x="11" y="15" width="14" height="8" rx="1" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <circle cx="14" cy="28" r="1.5" fill="rgba(255,255,255,0.35)"/>
              <circle cx="18" cy="28" r="1.5" fill="rgba(255,255,255,0.35)"/>
              <circle cx="22" cy="28" r="1.5" fill="rgba(255,255,255,0.35)"/>
            </svg>
            <span className="booth-photostrip-label">PHOTOSTRIP</span>
            <span className="booth-photostrip-sublabel">MEUBLE BIOM</span>
          </motion.div>

          {/* Print Slot — where photostrip comes out */}
          <div className="booth-print-slot-container">
            <div className="booth-print-slot" />

            {/* ── Photostrip coming out of the slot ─── */}
            <AnimatePresence>
              {showPhotostrip && photostripDataUrl && (
                <motion.div
                  key="photostrip-output"
                  initial={{ y: -280, opacity: 0 }}
                  animate={{ y: 8, opacity: 1 }}
                  exit={{ y: -280, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    damping: 14,
                    mass: 0.8,
                  }}
                  className="booth-strip-output"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photostripDataUrl}
                    alt="Your photostrip"
                    className="booth-strip-image"
                  />
                  <div className="booth-strip-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadStrip}
                      className="booth-strip-download-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v8M3 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 11h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Download
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearStrip}
                      className="booth-strip-clear-btn"
                    >
                      ✕
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </main>
  );
}
