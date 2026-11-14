import { afterEach, describe, expect, it, vi } from "vitest";

// The request as the protected layout sees it: the stale session cookie and
// the page the proxy says the Member opened.
const request = vi.hoisted(() => ({ returnTo: null as string | null }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "stale-token" }) }),
  headers: async () => new Headers(request.returnTo ? { "x-rpgclub-return-to": request.returnTo } : {}),
}));

import { requireAuth } from "./session";

const redirectTo = (error: unknown) => String((error as { digest?: string }).digest).split(";")[2];

describe("requireAuth with a lapsed session", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    request.returnTo = null;
  });

  it("sends the Member back through sign-in to the page they opened", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    request.returnTo = "/games/12?tab=reviews";
    const error = await requireAuth().catch((e: unknown) => e);
    expect(redirectTo(error)).toBe("/auth/sign-in?return_to=%2Fgames%2F12%3Ftab%3Dreviews");
  });

  it("signs in without a return-to when the proxy named no page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    const error = await requireAuth().catch((e: unknown) => e);
    expect(redirectTo(error)).toBe("/auth/sign-in");
  });
});
