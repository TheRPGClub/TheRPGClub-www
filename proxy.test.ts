import { readdirSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config, proxy } from "./proxy";

const SITE = "https://www.rpgclub.test";

function request(path: string, cookies: Record<string, string> = {}) {
  const headers = new Headers();
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(`${SITE}${path}`, { headers });
}

// NextResponse.next() is how a proxy lets a request through to the route.
function passesThrough(response: Response | undefined) {
  return response?.headers.get("x-middleware-next") === "1";
}

describe("proxy", () => {
  describe("public paths, without the session cookie", () => {
    it.each([
      "/",
      "/join",
      "/join?return_to=%2Fgames",
      "/join/continue?return_to=%2Fgames",
      "/auth/callback?token=abc",
      "/auth/sign-in?return_to=%2Fgames",
      "/codex/history",
      "/codex/history?kind=staff&order=newest",
      "/share-card",
      "/share-card?round=42&v=abc123",
      "/api/revalidate",
    ])("passes %s through", (path) => {
      expect(passesThrough(proxy(request(path)))).toBe(true);
    });
  });

  describe("a protected page without the session cookie", () => {
    beforeEach(() => vi.stubEnv("API_URL", "https://api.rpgclub.test"));
    afterEach(() => vi.unstubAllEnvs());

    it.each([
      ["/dashboard", "https://api.rpgclub.test/auth/discord?return_to=%2Fdashboard"],
      [
        "/games/12?tab=reviews&page=2",
        "https://api.rpgclub.test/auth/discord?return_to=%2Fgames%2F12%3Ftab%3Dreviews%26page%3D2",
      ],
      [
        "/members/123/achievements",
        "https://api.rpgclub.test/auth/discord?return_to=%2Fmembers%2F123%2Fachievements",
      ],
      [
        "/brand-new-page",
        "https://api.rpgclub.test/auth/discord?return_to=%2Fbrand-new-page",
      ],
      ["/joined", "https://api.rpgclub.test/auth/discord?return_to=%2Fjoined"],
      ["/codex/history/new", "https://api.rpgclub.test/auth/discord?return_to=%2Fcodex%2Fhistory%2Fnew"],
      ["/authors", "https://api.rpgclub.test/auth/discord?return_to=%2Fauthors"],
    ])("redirects %s to Discord sign-in with the return-to", (path, signIn) => {
      expect(getRedirectUrl(proxy(request(path)))).toBe(signIn);
    });

    it("signs in through the default API host when API_URL is unset", () => {
      vi.stubEnv("API_URL", undefined);
      expect(getRedirectUrl(proxy(request("/dashboard")))).toBe(
        "http://localhost:3000/auth/discord?return_to=%2Fdashboard",
      );
    });

    it("treats an empty session cookie as missing", () => {
      const response = proxy(request("/dashboard", { rpgclub_token: "" }));
      expect(getRedirectUrl(response)).toBe(
        "https://api.rpgclub.test/auth/discord?return_to=%2Fdashboard",
      );
    });
  });

  describe("the website's search endpoints without the session cookie", () => {
    it.each([
      "/api/games/search?q=chrono",
      "/api/members/search?q=sam",
      "/api/threads/search",
      "/api/igdb/search?q=zelda",
      "/api/imports/steam/items/4/igdb",
    ])("answers %s with a JSON 401", async (path) => {
      const response = proxy(request(path));
      expect(response.status).toBe(401);
      expect(getRedirectUrl(response)).toBeNull();
      expect(await response.json()).toEqual({ error: "unauthenticated" });
    });
  });

  describe("with the session cookie", () => {
    it.each(["/dashboard", "/games/12?tab=reviews", "/api/games/search?q=chrono", "/"])(
      "passes %s through",
      (path) => {
        const response = proxy(request(path, { rpgclub_token: "a-token" }));
        expect(passesThrough(response)).toBe(true);
      },
    );
  });

  // The protected layout cannot see the URL; when the session read fails it
  // sends the Member back through sign-in to the page they opened.
  describe("hands the protected layout the page's return-to", () => {
    const forwarded = (response: Response) =>
      response.headers.get("x-middleware-request-x-rpgclub-return-to");

    it.each([
      ["/dashboard", "/dashboard"],
      ["/games/12?tab=reviews&page=2", "/games/12?tab=reviews&page=2"],
    ])("forwards %s", (path, returnTo) => {
      expect(forwarded(proxy(request(path, { rpgclub_token: "a-token" })))).toBe(returnTo);
    });

    it("overwrites a return-to the browser sent", () => {
      const req = request("/dashboard", { rpgclub_token: "a-token" });
      req.headers.set("x-rpgclub-return-to", "//evil.example");
      expect(forwarded(proxy(req))).toBe("/dashboard");
    });
  });

  describe("the matcher", () => {
    // Every file in public/ and the app's metadata files (favicon, icons,
    // manifest, robots.txt from app/robots.ts) are public and skip the
    // proxy; nothing else does, whatever its extension.
    const publicFiles = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? publicFiles(path.join(dir, entry.name))
          : [path.join(dir, entry.name)],
      );
    const fromPublic = publicFiles(path.join(__dirname, "public")).map(
      (file) => `/${path.relative(path.join(__dirname, "public"), file).split(path.sep).join("/")}`,
    );
    const metadata = readdirSync(path.join(__dirname, "app"))
      .filter((name) => /^(?:favicon\.ico|icon\d*\.\w+|apple-icon\d*\.\w+|manifest\.webmanifest|robots\.ts)$/.test(name))
      .map((name) => `/${name.replace(/^robots\.ts$/, "robots.txt")}`);

    it("knows the public files", () => {
      expect(fromPublic).toContain("/logo.png");
      expect(metadata).toContain("/favicon.ico");
      expect(metadata).toContain("/robots.txt");
    });

    it.each([
      "/_next/static/chunks/main.js",
      "/_next/static/css/app.css",
      "/_next/image?url=%2Flogo.png&w=64&q=75",
      ...fromPublic,
      ...metadata,
    ])("skips %s", (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    });

    it.each([
      "/members/123/avatar.png",
      "/games/12/cover.jpg",
      "/templates/other.csv",
      "/notes.txt",
      "/feed.xml",
      "/fonts/face.woff2",
      "/logo.png/extra",
    ])("runs on %s, which is no public file", (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
    });

    it.each(["/", "/dashboard", "/games/12", "/api/games/search", "/auth/callback", "/join", "/join/continue"])(
      "runs on %s",
      (url) => {
        expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
      },
    );
  });
});
