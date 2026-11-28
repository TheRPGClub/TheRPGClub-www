import { cache } from "react";
import { cookies } from "next/headers";

import { getSession } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/sign-in";

import { aeroFonts } from "./aero/fonts";
import { monthlyIssueFonts } from "./monthly-issue/fonts";
import { resolveTheme, type Theme } from "./registry";

export { DEFAULT_THEME } from "./registry";

// Each Theme's font-variable classes, from its own fonts.ts. A Theme without
// fonts (the test Theme) uses system faces.
const FONT_CLASSES: Record<string, string> = {
  "monthly-issue": monthlyIssueFonts,
  "aero": aeroFonts,
};

// The signed-in Member's Theme key, from the request's one session read, on
// every page they open, public ones included: data-theme and theme-color both
// follow the session, so they change only at sign-in or sign-out, a full
// load (spec api#523). A Visitor has no session cookie and wears the default
// with no API call; a failed read falls back to it too.
async function memberTheme(): Promise<string | null> {
  if (!(await cookies()).get(SESSION_COOKIE)?.value) return null;
  return (await getSession())?.theme ?? null;
}

// The Theme the root layout puts on <html> (and its theme-color), decided on
// the server. Once per request: the layout and generateViewport share it.
export const rootTheme = cache(async (): Promise<{ theme: Theme; fontClassName: string }> => {
  const theme = resolveTheme(process.env, await memberTheme());
  return { theme, fontClassName: FONT_CLASSES[theme.name] ?? "" };
});
