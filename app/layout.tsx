import type { Metadata, Viewport } from "next";

import { fetchShareCardWinners, SHARE_CARD_METADATA_TIMEOUT_MS } from "@/lib/api/public-winners";
import { shareCardMetadata } from "@/lib/share-card/metadata";
import { rootTheme } from "@/themes";
import "./globals.css";

// Development-only Themes (themes/registry.ts) load here, in development
// alone, so production builds never ship their stylesheets.
if (process.env.NODE_ENV === "development") {
  await import("../themes/test/styles");
}

// The site-wide Share Card (spec api#518): one link preview for every page,
// its image keyed by the latest decided round. Pages that set their own
// title (/join, /codex/history) keep it. The read is kept short and falls
// back to the last good winners (lib/api/public-winners), so a sleeping API
// costs a page at most a moment.
export async function generateMetadata(): Promise<Metadata> {
  return shareCardMetadata(await fetchShareCardWinners(SHARE_CARD_METADATA_TIMEOUT_MS), process.env);
}

// theme-color is the page's Theme's background (the manifest keeps the
// default Theme's). viewportFit "cover": the page runs under a phone's notch
// and home indicator, so the safe-area insets are real numbers; the body
// keeps content clear of the notch at the sides, and fixed pieces (the
// sidebar, the phone tab bar) clear the insets themselves.
export async function generateViewport(): Promise<Viewport> {
  const { theme } = await rootTheme();
  return { themeColor: theme.themeColor, viewportFit: "cover" };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The Theme and its declared light or dark mode, set on the server
  // (api ADR-0008): the Member's own on signed-in routes, the default on
  // public ones (themes/index.ts). Dialogs and sheets portal into <body>,
  // so they take it too.
  const { theme, fontClassName } = await rootTheme();
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
