import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bscbinbin.vercel.app"),
  title: "BSCBINBIN",
  description:
    "A personal photography archive with immersive scrolling gallery.",
  openGraph: {
    title: "BSCBINBIN",
    description: "A personal photography archive with immersive scrolling gallery.",
    images: ["/portfolio/desktop-bg.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="dns-prefetch" href="https://www.openstreetmap.org" />
        <link rel="preconnect" href="https://www.openstreetmap.org" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
