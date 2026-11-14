import { NextRequest } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const SITE = "https://www.rpgclub.test";
const SIGN_IN = "https://api.rpgclub.test/auth/discord";

async function continueSignIn(query = "") {
  return await GET(new NextRequest(`${SITE}/join/continue${query}`));
}

describe("the join page's Continue", () => {
  beforeEach(() => vi.stubEnv("API_URL", "https://api.rpgclub.test"));
  afterEach(() => vi.unstubAllEnvs());

  it("restarts Discord sign-in with the same return-to", async () => {
    const response = await continueSignIn("?return_to=%2Fgames%2F12%3Ftab%3Dreviews");
    expect(getRedirectUrl(response)).toBe(`${SIGN_IN}?return_to=%2Fgames%2F12%3Ftab%3Dreviews`);
  });

  it("restarts sign-in without a return-to when there was none", async () => {
    expect(getRedirectUrl(await continueSignIn())).toBe(SIGN_IN);
  });

  it.each(["%2F%2Fevil.example", "https%3A%2F%2Fevil.example", "%2F%5Cevil.example"])(
    "drops an off-site return-to (%s)",
    async (returnTo) => {
      expect(getRedirectUrl(await continueSignIn(`?return_to=${returnTo}`))).toBe(SIGN_IN);
    },
  );

  it("marks the next visit to /join as a second try, for a short while", async () => {
    const retry = (await continueSignIn()).cookies.get("rpgclub_join_retry");
    expect(retry).toMatchObject({
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  });
});
