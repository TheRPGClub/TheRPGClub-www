import { describe, expect, it } from "vitest";

import { DEFAULT_THEME, resolveTheme } from "./registry";

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
