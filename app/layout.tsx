import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foto Kita Blur ✌️",
  description:
    "Tunjukkan gesture Peace dan lihat kamera kamu jadi blur secara ajaib!",
  keywords: ["foto blur", "peace gesture", "kamera selfie", "AI gesture"],
  authors: [{ name: "Foto Kita Blur" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-black overflow-hidden">{children}</body>
    </html>
  );
}
