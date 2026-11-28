import { afterEach, describe, expect, it, vi } from "vitest";

// The root layout's Theme follows the session, not the route (spec api#523):
// a Visitor (no session cookie) gets the default with no API call, a
// signed-in Member their own Theme on any page.
const request = vi.hoisted(() => ({ token: null as string | null }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (request.token ? { value: request.token } : undefined) }),
  headers: async () => new Headers(),
}));
vi.mock("./aero/fonts", () => ({ aeroFonts: "aero-fonts" }));
vi.mock("./monthly-issue/fonts", () => ({ monthlyIssueFonts: "monthly-fonts" }));

const { rootTheme } = await import("./index");

const sessionWithTheme = (theme: string) =>
  vi.fn(async () => new Response(JSON.stringify({ theme }), { status: 200 }));

describe("rootTheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    request.token = null;
  });

  it("gives a Visitor the default Theme without reading the session", async () => {
    const fetch = sessionWithTheme("aero");
    vi.stubGlobal("fetch", fetch);
    const { theme, fontClassName } = await rootTheme();
    expect(theme.name).toBe("monthly-issue");
    expect(fontClassName).toBe("monthly-fonts");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("gives a signed-in Member their Theme", async () => {
    request.token = "a-token";
    vi.stubGlobal("fetch", sessionWithTheme("aero"));
    const { theme, fontClassName } = await rootTheme();
    expect(theme.name).toBe("aero");
    expect(fontClassName).toBe("aero-fonts");
  });

  it("falls back to the default for an unknown key or a failed read", async () => {
    request.token = "a-token";
    vi.stubGlobal("fetch", sessionWithTheme("no-such-theme"));
    expect((await rootTheme()).theme.name).toBe("monthly-issue");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    expect((await rootTheme()).theme.name).toBe("monthly-issue");
  });
});
