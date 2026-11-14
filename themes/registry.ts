// The website's Themes (api ADR-0008): each is a folder under themes/ with its
// stylesheet, fonts, assets and README. This list is what the root layout
// can put on <html data-theme data-mode>. A shipped Theme's stylesheet is
// imported once from app/globals.css; a development-only one is loaded by
// the root layout in development alone, so production never ships it. Each
// is scoped to its [data-theme] value. themes/wiring.test.ts checks it.

export type ThemeMode = "light" | "dark";

export type Theme = {
  name: string;
  mode: ThemeMode;
  // The browser chrome colour (viewport theme-color), the Theme's background.
  themeColor: string;
  // Development only: its stylesheet is left out of production builds.
  devOnly?: boolean;
};

export const MONTHLY_ISSUE: Theme = {
  name: "monthly-issue",
  mode: "dark",
  themeColor: "#0b0b0d",
};

// A throwaway Theme that swaps every token for a loud colour, so a surface
// still naming the Monthly Issue palette stands out. Development only.
export const TEST_THEME: Theme = {
  name: "test",
  mode: "light",
  themeColor: "#00ff66",
  devOnly: true,
};

export const THEMES: readonly Theme[] = [MONTHLY_ISSUE, TEST_THEME];

export const DEFAULT_THEME = MONTHLY_ISSUE;

type ThemeEnv = { NODE_ENV?: string; DEV_THEME?: string };

// The Theme for this request. Always the default for now (the Member's choice
// is a follow-up spec); in development DEV_THEME=<name> picks another.
export function resolveTheme(env: ThemeEnv): Theme {
  if (env.NODE_ENV !== "development" || !env.DEV_THEME) return DEFAULT_THEME;
  return THEMES.find((theme) => theme.name === env.DEV_THEME) ?? DEFAULT_THEME;
}
