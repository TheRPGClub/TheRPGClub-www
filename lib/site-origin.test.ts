import { describe, expect, it } from "vitest";

import { siteOrigin } from "./site-origin";

const headers = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });

describe("siteOrigin", () => {
  it("uses SITE_URL, whatever the request says", () => {
    const h = headers({ host: "evil.example", "x-forwarded-host": "evil.example" });
    expect(siteOrigin({ SITE_URL: "https://therpgclub.com/", NODE_ENV: "production" }, h)).toBe("https://therpgclub.com");
  });

  it("falls back to Vercel's production domain", () => {
    expect(siteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "therpgclub.com", NODE_ENV: "production" }, null)).toBe("https://therpgclub.com");
  });

  it("never reads the request's host in production", () => {
    expect(siteOrigin({ NODE_ENV: "production" }, headers({ host: "therpgclub.com", "x-forwarded-host": "evil.example" }))).toBeNull();
  });

  it("reads the host (not X-Forwarded-Host) in development", () => {
    const h = headers({ host: "localhost:8080", "x-forwarded-host": "evil.example" });
    expect(siteOrigin({ NODE_ENV: "development" }, h)).toBe("http://localhost:8080");
  });

  it("ignores a SITE_URL that isn't an http(s) origin", () => {
    expect(siteOrigin({ SITE_URL: "javascript:alert(1)", NODE_ENV: "production" }, null)).toBeNull();
  });
});
