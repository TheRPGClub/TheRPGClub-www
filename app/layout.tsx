import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The RPG Club",
  description: "The RPG Club community hub",
};

// Matches the manifest's theme_color; the UI is dark-only (see <html className="dark">).
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} dark antialiased`} suppressHydrationWarning>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
