import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./return-to";

describe("safeReturnTo", () => {
  it.each([
    "/dashboard",
    "/games/12?tab=reviews&page=2",
    "/members/123/achievements#rarest",
    "/",
  ])("keeps the same-origin path %s", (path) => {
    expect(safeReturnTo(path)).toBe(path);
  });

  it.each([
    ["protocol-relative", "//evil.example/dashboard"],
    ["absolute", "https://evil.example/dashboard"],
    ["scheme", "javascript:alert(1)"],
    ["backslash", "/\\evil.example"],
    ["backslash later on", "/games\\..\\evil"],
    ["relative", "dashboard"],
    ["a tab", "/\t/evil.example"],
    ["a newline", "/games\n"],
    ["empty", ""],
  ])("refuses a %s value", (_kind, value) => {
    expect(safeReturnTo(value)).toBeNull();
  });

  it("refuses a missing value", () => {
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo(undefined)).toBeNull();
  });

  it("refuses a value past the API's 2048-character cap", () => {
    expect(safeReturnTo(`/${"a".repeat(2047)}`)).toHaveLength(2048);
    expect(safeReturnTo(`/${"a".repeat(2048)}`)).toBeNull();
  });
});
