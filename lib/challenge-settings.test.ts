import { describe, expect, it } from "vitest";

import type { SessionFeature } from "@/lib/features";
import { challengeDmsBody, challengeDmsShown } from "@/lib/challenge-settings";

const feature = (key: string, shown: boolean): SessionFeature => ({
  key,
  name: key,
  state: "live",
  hideable: true,
  shown,
  preview: false,
});

describe("challengeDmsShown", () => {
  it("shows the DM switch only while the Challenges Feature is shown", () => {
    expect(challengeDmsShown([feature("challenges", true)])).toBe(true);
    expect(challengeDmsShown([feature("challenges", false)])).toBe(false);
  });

  it("hides it when the session doesn't list Challenges (its flag hides it)", () => {
    expect(challengeDmsShown([feature("news_hub", true)])).toBe(false);
  });

  it("hides it when the session carries no Feature list at all", () => {
    expect(challengeDmsShown(undefined)).toBe(false);
  });
});

describe("challengeDmsBody", () => {
  it("sends the switch as the PATCH body", () => {
    expect(challengeDmsBody(false)).toEqual({ data: { dms: false } });
    expect(challengeDmsBody(true)).toEqual({ data: { dms: true } });
  });
});
