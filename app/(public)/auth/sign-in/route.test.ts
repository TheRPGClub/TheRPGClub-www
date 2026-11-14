import { NextRequest, type NextResponse } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const SITE = "https://www.rpgclub.test";
const SIGN_IN = "https://api.rpgclub.test/auth/discord";

async function signInAgain(query = "", cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  return await GET(new NextRequest(`${SITE}/auth/sign-in${query}`, { headers }));
}

function cleared(response: NextResponse, name: string) {
  const cookie = response.cookies.get(name);
  return cookie?.value === "" && new Date(cookie.expires ?? Date.now() + 1).getTime() <= Date.now();
}

describe("signing in again after the session lapsed", () => {
  beforeEach(() => vi.stubEnv("API_URL", "https://api.rpgclub.test"));
  afterEach(() => vi.unstubAllEnvs());

  it("starts Discord sign-in with the return-to", async () => {
    const response = await signInAgain("?return_to=%2Fgames%2F12%3Ftab%3Dreviews", "rpgclub_token=stale");
    expect(getRedirectUrl(response)).toBe(`${SIGN_IN}?return_to=%2Fgames%2F12%3Ftab%3Dreviews`);
  });

  it.each(["", "?return_to=%2F%2Fevil.example"])("starts plain sign-in for %o", async (query) => {
    expect(getRedirectUrl(await signInAgain(query))).toBe(SIGN_IN);
  });

  it("drops the stale session cookie", async () => {
    expect(cleared(await signInAgain("", "rpgclub_token=stale"), "rpgclub_token")).toBe(true);
  });

  it("remembers the try for a minute", async () => {
    expect((await signInAgain()).cookies.get("rpgclub_sign_in_again")).toMatchObject({
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60,
    });
  });

  // A session that fails again right after signing in would otherwise send
  // the Member round Discord forever.
  it("stops at the auth-failed front page on a second try within that minute", async () => {
    const response = await signInAgain("?return_to=%2Fdashboard", "rpgclub_token=fresh; rpgclub_sign_in_again=1");
    expect(getRedirectUrl(response)).toBe(`${SITE}/?error=auth_failed`);
    expect(cleared(response, "rpgclub_token")).toBe(true);
    expect(cleared(response, "rpgclub_sign_in_again")).toBe(true);
  });
});
