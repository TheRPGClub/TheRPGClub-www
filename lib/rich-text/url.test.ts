import { describe, expect, it } from "vitest";

import { sanitizeUrl } from "./url";

describe("sanitizeUrl", () => {
  it("keeps a root-relative link to this site as written", () => {
    expect(sanitizeUrl("/codex/lore/3")).toBe("/codex/lore/3");
    expect(sanitizeUrl("  /games/12?tab=reviews#top ")).toBe("/games/12?tab=reviews#top");
  });

  it("refuses a root-relative link a browser would send to another host", () => {
    expect(sanitizeUrl("/\\evil.example")).toBeNull();
    expect(sanitizeUrl("/\\/evil.example/path")).toBeNull();
    expect(sanitizeUrl("/\t/evil.example")).toBeNull();
  });

  it("resolves a protocol-relative link as https, and refuses unsafe schemes", () => {
    expect(sanitizeUrl("//example.com/x")).toBe("https://example.com/x");
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
  });

  it("drops NUL characters", () => {
    expect(sanitizeUrl("/codex\u0000/lore")).toBe("/codex/lore");
    expect(sanitizeUrl("https://example.com/a\u0000b")).toBe("https://example.com/ab");
  });
});
