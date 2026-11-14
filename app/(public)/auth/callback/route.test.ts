import { NextRequest } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";
import { GET } from "./route";

const SITE = "https://www.rpgclub.test";

async function callback(query: Record<string, string>, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  const search = new URLSearchParams(query);
  return await GET(new NextRequest(`${SITE}/auth/callback?${search}`, { headers }));
}

describe("the sign-in callback", () => {
  it("sets the session cookie from the token", async () => {
    const cookie = (await callback({ token: "abc123" })).cookies.get("rpgclub_token");
    expect(cookie).toMatchObject({
      value: "abc123",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  });

  it("goes to the dashboard without a return-to", async () => {
    expect(getRedirectUrl(await callback({ token: "abc123" }))).toBe(`${SITE}/dashboard`);
  });

  it.each(["/games/12?tab=reviews&page=2", "/members/123/achievements", "/"])(
    "honours the return-to %s",
    async (returnTo) => {
      const response = await callback({ token: "abc123", return_to: returnTo });
      expect(getRedirectUrl(response)).toBe(`${SITE}${returnTo}`);
    },
  );

  it.each([
    ["protocol-relative", "//evil.example/dashboard"],
    ["absolute", "https://evil.example/dashboard"],
    ["scheme", "javascript:alert(1)"],
    ["backslash", "/\\evil.example"],
  ])("falls back to the dashboard for a %s return-to", async (_kind, returnTo) => {
    const response = await callback({ token: "abc123", return_to: returnTo });
    expect(getRedirectUrl(response)).toBe(`${SITE}/dashboard`);
    expect(response.cookies.get("rpgclub_token")?.value).toBe("abc123");
  });

  it("clears the join page's second-try cookie", async () => {
    const response = await callback({ token: "abc123" }, "rpgclub_join_retry=1");
    const retry = response.cookies.get("rpgclub_join_retry");
    expect(retry?.value).toBe("");
    expect(new Date(retry?.expires ?? Date.now() + 1).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it.each<Record<string, string>>([{}, { token: "" }, { return_to: "/games/12" }])(
    "sends a missing token to the auth-failed front page (%o)",
    async (query) => {
      const response = await callback(query);
      expect(getRedirectUrl(response)).toBe(`${SITE}/?error=auth_failed`);
      expect(response.cookies.get("rpgclub_token")).toBeUndefined();
    },
  );
});
