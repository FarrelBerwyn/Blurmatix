# Foto Kita Blur ✌️

Website kamera selfie dengan deteksi gesture Peace menggunakan MediaPipe AI. Saat kamu menunjukkan gesture ✌️, tampilan kamera berubah blur secara otomatis.

## Deploy ke GitHub Pages

### Langkah 1 — Buat repository di GitHub

Buat repo baru di https://github.com/new  
Contoh nama repo: `foto-kita-blur`

### Langkah 2 — Set repository variable

Di GitHub repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_BASE_PATH` | `foto-kita-blur` ← nama repo kamu |

> Kalau repo kamu adalah `github.com/username/foto-kita-blur` maka valuenya `foto-kita-blur`  
> Kalau pakai custom domain atau repo bernama `username.github.io`, biarkan kosong `""`

### Langkah 3 — Enable GitHub Pages

Di GitHub repo → **Settings → Pages**:
- **Source**: `GitHub Actions`

### Langkah 4 — Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

GitHub Actions akan otomatis build dan deploy. Setelah ~2 menit, website live di:

```
https://USERNAME.github.io/REPO_NAME/
```

## Development lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Tech Stack

- Next.js 16 (App Router, Static Export)
- TypeScript
- TailwindCSS
- Framer Motion
- MediaPipe Tasks Vision (Hand Landmarker)
- WebRTC getUserMedia
