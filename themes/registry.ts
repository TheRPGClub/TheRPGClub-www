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

// Set by proxy.ts on a signed-in route's request, and stripped from every
// other: the root layout reads the Member's Theme from the session only when
// it is there, so public pages always get the default (spec api#523).
export const MEMBER_THEME_HEADER = "x-rpgclub-member-theme";

type ThemeEnv = { NODE_ENV?: string; DEV_THEME?: string };

// A shipped Theme by its key (the API's Theme keys, which it resolves for
// the Member). A development-only Theme never comes from the session.
function shippedTheme(key: string | null | undefined): Theme | undefined {
  return THEMES.find((theme) => theme.name === key && !theme.devOnly);
}

// Whether this website can draw the Theme with this key: the Settings
// picker offers only those, since any other renders as the default.
export function shipsTheme(key: string): boolean {
  return shippedTheme(key) !== undefined;
}

// The Theme for this request: the Member's Theme from the session (null on
// public pages, or when the session read failed), falling back to the
// default for a key this website has no stylesheet for. In development
// DEV_THEME=<name> overrides it.
export function resolveTheme(env: ThemeEnv, memberTheme?: string | null): Theme {
  if (env.NODE_ENV === "development" && env.DEV_THEME) {
    const devTheme = THEMES.find((theme) => theme.name === env.DEV_THEME);
    if (devTheme) return devTheme;
  }
  return shippedTheme(memberTheme) ?? DEFAULT_THEME;
}
