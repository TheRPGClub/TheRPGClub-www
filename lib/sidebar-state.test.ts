import { describe, expect, it } from "vitest";
import { sidebarOpenFromCookie } from "@/lib/sidebar-state";

describe("sidebarOpenFromCookie", () => {
  it("is collapsed only when the member collapsed it", () => {
    expect(sidebarOpenFromCookie("false")).toBe(false);
  });

  it("is expanded when expanded, unset or unreadable", () => {
    expect(sidebarOpenFromCookie("true")).toBe(true);
    expect(sidebarOpenFromCookie(undefined)).toBe(true);
    expect(sidebarOpenFromCookie("")).toBe(true);
    expect(sidebarOpenFromCookie("nonsense")).toBe(true);
  });
});
