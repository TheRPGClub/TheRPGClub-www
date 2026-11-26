import type { Metadata, Viewport } from "next";

import { fetchShareCardWinners } from "@/lib/api/public-winners";
import { shareCardMetadata } from "@/lib/share-card/metadata";
import { DEFAULT_THEME, rootTheme } from "@/themes";
import "./globals.css";

// Development-only Themes (themes/registry.ts) load here, in development
// alone, so production builds never ship their stylesheets.
if (process.env.NODE_ENV === "development") {
  await import("../themes/test/styles");
}

// The site-wide Share Card (spec api#518): one link preview for every page,
// its image keyed by the latest decided round. Pages that set their own
// title (/join, /codex/history) keep it.
export async function generateMetadata(): Promise<Metadata> {
  return shareCardMetadata(await fetchShareCardWinners(), process.env);
}

// Matches the manifest's theme_color: the default Theme's background.
// viewportFit "cover": the page runs under a phone's notch and home
// indicator, so the safe-area insets are real numbers; the body keeps
// content clear of the notch at the sides, and fixed pieces (the sidebar,
// the phone tab bar) clear the insets themselves.
export const viewport: Viewport = {
  themeColor: DEFAULT_THEME.themeColor,
  viewportFit: "cover",
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
