import { describe, expect, it } from "vitest";

import type { SessionTheme } from "@/lib/auth-types";
import { themeCards, themeChoiceBody, themeToSave } from "./theme-picker";

const monthly: SessionTheme = { key: "monthly-issue", name: "Monthly Issue", released: true, available: true };
const aero: SessionTheme = { key: "aero", name: "Frutiger Aero", released: false, available: true };

describe("themeCards", () => {
  it("is null when only the default is listed, or the session has no themes", () => {
    expect(themeCards({ chosen: null, list: [monthly] })).toBeNull();
    expect(themeCards(undefined)).toBeNull();
  });

  it("leaves out a Theme this website can't draw", () => {
    const later = { key: "vaporwave", name: "Vaporwave", released: true, available: true };
    expect(themeCards({ chosen: null, list: [monthly, later] })).toBeNull();
  });

  it("marks the default as chosen and Club default when the Member chose nothing", () => {
    const cards = themeCards({ chosen: null, list: [monthly, aero] });
    expect(cards).toEqual([
      { key: "monthly-issue", name: "Monthly Issue", clubDefault: true, chosen: true, available: true, staffPreview: false },
      { key: "aero", name: "Frutiger Aero", clubDefault: false, chosen: false, available: true, staffPreview: true },
    ]);
  });

  it("marks the Member's stored Theme as chosen", () => {
    const cards = themeCards({ chosen: "aero", list: [monthly, aero] });
    expect(cards?.map((c) => [c.key, c.chosen])).toEqual([["monthly-issue", false], ["aero", true]]);
  });

  it("keeps an unavailable stored Theme chosen, unavailable and without the staff mark", () => {
    const locked = { ...aero, available: false };
    const card = themeCards({ chosen: "aero", list: [monthly, locked] })?.[1];
    expect(card).toMatchObject({ chosen: true, available: false, staffPreview: false });
  });

  it("falls back to the default as chosen for a stored key the API no longer lists", () => {
    const cards = themeCards({ chosen: "gone", list: [monthly, aero] });
    expect(cards?.find((c) => c.chosen)?.key).toBe("monthly-issue");
  });

  it("carries no staff mark on a Released Theme", () => {
    expect(themeCards({ chosen: null, list: [monthly, { ...aero, released: true }] })?.[1].staffPreview).toBe(false);
  });
});

describe("themeChoiceBody", () => {
  it("sends null for the club default and the key for any other Theme", () => {
    expect(themeChoiceBody("monthly-issue")).toEqual({ theme: null });
    expect(themeChoiceBody("aero")).toEqual({ theme: "aero" });
  });
});

describe("themeToSave", () => {
  const cards = themeCards({ chosen: null, list: [monthly, aero] })!;

  it("saves the newly pressed Theme (Space, Enter or a click)", () => {
    expect(themeToSave(["monthly-issue", "aero"], cards, false)).toBe("aero");
    expect(themeToSave(["aero"], cards, false)).toBe("aero");
  });
  it("saves nothing when the chosen card is pressed again, or while a save is on its way", () => {
    expect(themeToSave([], cards, false)).toBeNull();
    expect(themeToSave(["monthly-issue"], cards, false)).toBeNull();
    expect(themeToSave(["aero"], cards, true)).toBeNull();
  });
  it("saves nothing for a Theme the Member may not choose, or an unknown key", () => {
    const locked = themeCards({ chosen: "monthly-issue", list: [monthly, { ...aero, available: false }] })!;
    expect(themeToSave(["aero"], locked, false)).toBeNull();
    expect(themeToSave(["nope"], cards, false)).toBeNull();
  });
});
