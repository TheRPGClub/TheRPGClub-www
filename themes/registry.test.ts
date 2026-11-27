import { describe, expect, it } from "vitest";

import { DEFAULT_THEME, THEMES, resolveTheme } from "./registry";

describe("resolveTheme", () => {
  it("is the Monthly Issue Theme, in dark mode, by default", () => {
    const theme = resolveTheme({ NODE_ENV: "production" });
    expect(theme.name).toBe("monthly-issue");
    expect(theme.mode).toBe("dark");
    expect(theme).toBe(DEFAULT_THEME);
  });

  it("switches to the test Theme in development when DEV_THEME asks for it", () => {
    const theme = resolveTheme({ NODE_ENV: "development", DEV_THEME: "test" });
    expect(theme.name).toBe("test");
  });

  it("never serves the test Theme outside development", () => {
    expect(resolveTheme({ NODE_ENV: "production", DEV_THEME: "test" }).name).toBe("monthly-issue");
    expect(resolveTheme({ NODE_ENV: "test", DEV_THEME: "test" }).name).toBe("monthly-issue");
  });

  it("falls back to the default for an unknown Theme name", () => {
    expect(resolveTheme({ NODE_ENV: "development", DEV_THEME: "nope" }).name).toBe("monthly-issue");
  });
});

describe("resolveTheme with the Member's Theme from the session", () => {
  const production = { NODE_ENV: "production" };

  it("is the Member's Theme when this website has it", () => {
    expect(resolveTheme(production, "monthly-issue")).toBe(DEFAULT_THEME);
  });

  it("is the default on a public page, or when the session read failed", () => {
    expect(resolveTheme(production, null)).toBe(DEFAULT_THEME);
    expect(resolveTheme(production, undefined)).toBe(DEFAULT_THEME);
  });

  it("is the default for a key this website has no stylesheet for", () => {
    expect(resolveTheme(production, "aero")).toBe(DEFAULT_THEME);
    expect(resolveTheme(production, "nope")).toBe(DEFAULT_THEME);
  });

  it("never gives a development-only Theme from the session", () => {
    expect(resolveTheme(production, "test")).toBe(DEFAULT_THEME);
    expect(resolveTheme({ NODE_ENV: "development" }, "test")).toBe(DEFAULT_THEME);
  });

  it("lets DEV_THEME override it in development", () => {
    expect(resolveTheme({ NODE_ENV: "development", DEV_THEME: "test" }, "monthly-issue").name).toBe("test");
  });
});

// The API owns the Theme keys (spec api#523, as with Pinned Pages): a copy of
// the keys in TheRPGClub-api app/services/themes.rb (Themes::LIST). Update it
// when the API adds a Theme.
const API_THEME_KEYS = ["monthly-issue", "aero"];
// API Themes whose stylesheet this website has not shipped yet: a Member
// whose session names one gets the default until it is registered here.
const NOT_YET_ON_THE_WEBSITE = ["aero"];

describe("the registry and the API's Theme keys", () => {
  const websiteKeys = THEMES.filter((theme) => !theme.devOnly).map((theme) => theme.name);

  it("registers only keys the API knows", () => {
    expect(websiteKeys.filter((key) => !API_THEME_KEYS.includes(key))).toEqual([]);
  });

  it("registers every API key, less the ones not yet on the website", () => {
    expect([...websiteKeys].sort()).toEqual(
      API_THEME_KEYS.filter((key) => !NOT_YET_ON_THE_WEBSITE.includes(key)).sort(),
    );
  });

  it("makes the default Theme the API's default", () => {
    expect(DEFAULT_THEME.name).toBe("monthly-issue");
  });
});
