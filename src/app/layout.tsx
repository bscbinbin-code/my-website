import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desktop Photo Home",
  description:
    "A desktop-inspired personal photography homepage.",
  openGraph: {
    title: "Desktop Photo Home",
    description: "A desktop-inspired personal photography homepage.",
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
