import { describe, expect, it } from "vitest";
import {
  hiddenCount,
  hideableChoices,
  isPlatformIdList,
  platformNames,
  upcomingReleasesTag,
  withHidden,
  withoutHidden,
} from "./hidden-platforms";

describe("Hidden Platforms", () => {
  it("adds a platform once, in id order", () => {
    expect(withHidden([9, 3], 5)).toEqual([3, 5, 9]);
    expect(withHidden([3], 3)).toEqual([3]);
  });

  it("removes a platform", () => {
    expect(withoutHidden([3, 5], 3)).toEqual([5]);
    expect(withoutHidden([5], 3)).toEqual([5]);
  });

  it("checks a save's ids", () => {
    expect(isPlatformIdList([])).toBe(true);
    expect(isPlatformIdList([1, 2])).toBe(true);
    expect(isPlatformIdList([0])).toBe(false);
    expect(isPlatformIdList([1.5])).toBe(false);
    expect(isPlatformIdList(["1"])).toBe(false);
    expect(isPlatformIdList(null)).toBe(false);
  });

  it("names the platforms", () => {
    expect(platformNames([])).toBe("");
    expect(platformNames(["PS4"])).toBe("PS4");
    expect(platformNames(["PS4", "Xbox One"])).toBe("PS4 and Xbox One");
    expect(platformNames(["PS4", "Xbox One", "Switch"])).toBe("PS4, Xbox One and Switch");
  });

  it("counts them", () => {
    expect(hiddenCount(1)).toBe("1 platform hidden");
    expect(hiddenCount(2)).toBe("2 platforms hidden");
  });

  it("offers only the platforms not hidden yet", () => {
    const choices = [
      { id: 1, name: "PC" },
      { id: 2, name: "PS4" },
    ];
    expect(hideableChoices(choices, [2])).toEqual([{ id: 1, name: "PC" }]);
  });

  it("tags a member's reads", () => {
    expect(upcomingReleasesTag("42")).toBe("upcoming-releases:42");
  });
});
