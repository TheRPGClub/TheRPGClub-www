import { describe, expect, it, vi } from "vitest";
import { localKey } from "./local-key";

describe("localKey", () => {
  it("gives a fresh key each call, even in the same millisecond", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const keys = new Set(Array.from({ length: 50 }, () => localKey("cover")));
    expect(keys.size).toBe(50);
    vi.restoreAllMocks();
  });

  it("starts with its prefix", () => {
    expect(localKey("release")).toMatch(/^release-/);
  });

  it("doesn't need crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {});
    expect(() => localKey("x")).not.toThrow();
    vi.unstubAllGlobals();
  });
});
