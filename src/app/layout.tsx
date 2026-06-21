import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Photo Archive",
  description:
    "A personal photography archive with immersive scrolling gallery.",
  openGraph: {
    title: "Photo Archive",
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
