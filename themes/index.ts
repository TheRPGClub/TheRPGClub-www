import { monthlyIssueFonts } from "./monthly-issue/fonts";
import { resolveTheme, type Theme } from "./registry";

export { DEFAULT_THEME } from "./registry";

// Each Theme's font-variable classes, from its own fonts.ts. A Theme without
// fonts (the test Theme) uses system faces.
const FONT_CLASSES: Record<string, string> = {
  "monthly-issue": monthlyIssueFonts,
};

// The Theme the root layout puts on <html>, decided on the server.
export function rootTheme(): { theme: Theme; fontClassName: string } {
  const theme = resolveTheme(process.env);
  return { theme, fontClassName: FONT_CLASSES[theme.name] ?? "" };
}
