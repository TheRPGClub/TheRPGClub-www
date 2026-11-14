import { describe, expect, it } from "vitest";
import { hourItems, platformItems, sourceItems } from "./backlog-pick-blanks";

describe("the picker sentence's blanks", () => {
  it("offers all the time, then the hour stops", () => {
    const items = hourItems(null);
    expect(items[0]).toEqual({ value: "", label: "all the time" });
    expect(items.slice(1, 3)).toEqual([
      { value: "5", label: "up to 5 hours" },
      { value: "10", label: "up to 10 hours" },
    ]);
    expect(items).toHaveLength(10);
  });

  it("keeps an hour limit from the URL that is not a stop, in order", () => {
    const values = hourItems(12).map((i) => i.value);
    expect(values.slice(0, 4)).toEqual(["", "5", "10", "12"]);
    expect(hourItems(1).find((i) => i.value === "1")?.label).toBe("up to 1 hour");
  });

  it("names each platform with its count, falling back to its abbreviation or id", () => {
    const items = platformItems(null, [
      { platform_id: 6, platform_name: "PC", platform_abbreviation: "PC", count: 4 },
      { platform_id: 9, platform_name: null, platform_abbreviation: "SNES", count: 1 },
      { platform_id: 11, platform_name: null, platform_abbreviation: null, count: 2 },
    ]);
    expect(items).toEqual([
      { value: "", label: "any platform" },
      { value: "6", label: "PC (4)" },
      { value: "9", label: "SNES (1)" },
      { value: "11", label: "Platform #11 (2)" },
    ]);
  });

  it("keeps a platform from the URL that has no candidates left", () => {
    expect(platformItems(42, [])).toEqual([
      { value: "", label: "any platform" },
      { value: "42", label: "platform #42" },
    ]);
  });

  it("lists the sources in lower case", () => {
    expect(sourceItems().map((i) => i.label)).toEqual([
      "backlog",
      "collection",
      "backlog and collection",
    ]);
  });
});
