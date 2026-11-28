import { cache } from "react";
import { headers } from "next/headers";

import { getSession } from "@/lib/session";

import { aeroFonts } from "./aero/fonts";
import { monthlyIssueFonts } from "./monthly-issue/fonts";
import { MEMBER_THEME_HEADER, resolveTheme, type Theme } from "./registry";

export { DEFAULT_THEME } from "./registry";

// Each Theme's font-variable classes, from its own fonts.ts. A Theme without
// fonts (the test Theme) uses system faces.
const FONT_CLASSES: Record<string, string> = {
  "monthly-issue": monthlyIssueFonts,
  "aero": aeroFonts,
};

// The Member's Theme key on a signed-in route (proxy.ts marks those), from
// the request's one session read; null on public pages, which never read the
// session for a Theme, and when the read fails.
async function memberTheme(): Promise<string | null> {
  if (!(await headers()).has(MEMBER_THEME_HEADER)) return null;
  return (await getSession())?.theme ?? null;
}

// The Theme the root layout puts on <html> (and its theme-color), decided on
// the server. Once per request: the layout and generateViewport share it.
export const rootTheme = cache(async (): Promise<{ theme: Theme; fontClassName: string }> => {
  const theme = resolveTheme(process.env, await memberTheme());
  return { theme, fontClassName: FONT_CLASSES[theme.name] ?? "" };
});
