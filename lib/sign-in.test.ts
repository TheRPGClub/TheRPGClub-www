import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callbackPath, discordSignInUrl, joinContinuePath } from "./sign-in";

describe("discordSignInUrl", () => {
  beforeEach(() => vi.stubEnv("API_URL", "https://api.rpgclub.test"));
  afterEach(() => vi.unstubAllEnvs());

  it("starts sign-in with the return-to", () => {
    expect(discordSignInUrl("/games/12?tab=reviews")).toBe(
      "https://api.rpgclub.test/auth/discord?return_to=%2Fgames%2F12%3Ftab%3Dreviews",
    );
  });

  it.each([undefined, null, "//evil.example"])("starts plain sign-in for %o", (returnTo) => {
    expect(discordSignInUrl(returnTo)).toBe("https://api.rpgclub.test/auth/discord");
  });
});

// Before the cutover (www#84) the API hands the token to the front page,
// which forwards it to the callback.
describe("callbackPath", () => {
  it("forwards the token and the return-to", () => {
    expect(callbackPath("a b+c", "/games/12?tab=reviews")).toBe(
      "/auth/callback?token=a+b%2Bc&return_to=%2Fgames%2F12%3Ftab%3Dreviews",
    );
  });

  it.each([undefined, "https://evil.example"])("forwards the token alone for %o", (returnTo) => {
    expect(callbackPath("abc", returnTo)).toBe("/auth/callback?token=abc");
  });
});

describe("joinContinuePath", () => {
  it("keeps the return-to", () => {
    expect(joinContinuePath("/members/123")).toBe("/join/continue?return_to=%2Fmembers%2F123");
  });

  it.each([undefined, "//evil.example"])("goes without one for %o", (returnTo) => {
    expect(joinContinuePath(returnTo)).toBe("/join/continue");
  });
});
