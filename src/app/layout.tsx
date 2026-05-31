import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
