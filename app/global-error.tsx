"use client";

import { DEFAULT_THEME } from "@/themes/registry";
import { monthlyIssueFonts } from "@/themes/monthly-issue/fonts";
import { BareFrame } from "@/components/misprint/bare-frame";
import { ErrorView } from "@/components/misprint/error-view";
import "./globals.css";

// The root layout itself broke: this replaces it, so it brings its own
// <html>, the default Theme and its fonts.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME.name} data-mode={DEFAULT_THEME.mode} className={`${monthlyIssueFonts} antialiased`}>
      <body className="min-h-svh">
        <title>Misprint · The RPG Club</title>
        <BareFrame>
          <ErrorView error={error} retry={unstable_retry} viewer="visitor" />
        </BareFrame>
      </body>
    </html>
  );
}
