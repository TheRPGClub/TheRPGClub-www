import type { Metadata, Viewport } from "next";

import { DEFAULT_THEME, rootTheme } from "@/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "The RPG Club",
  description: "The RPG Club community hub",
};

// Matches the manifest's theme_color: the default Theme's background.
export const viewport: Viewport = {
  themeColor: DEFAULT_THEME.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The Theme and its declared light or dark mode, set on the server
  // (api ADR-0008). Always the default Theme for now.
  const { theme, fontClassName } = rootTheme();
  return (
    <html
      lang="en"
      data-theme={theme.name}
      data-mode={theme.mode}
      className={[fontClassName, "antialiased"].filter(Boolean).join(" ")}
      suppressHydrationWarning
    >
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
