import { describe, expect, it } from "vitest";

import type { GameCompletion, Platform } from "@/lib/api/types";
import { completionHistory, firstCompletionLine, timesTag } from "./history";

const snes = { platform_id: 1, platform_name: "Super Nintendo", platform_abbreviation: "SNES" } as Platform;

const done = (id: number, completedAt: string | null, extra: Partial<GameCompletion> = {}) =>
  ({
    completion_id: id,
    user_id: "u1",
    gamedb_game_id: 42,
    platform_id: null,
    note: null,
    completion_type: "Main Story",
    completed_at: completedAt,
    final_playtime_hrs: null,
    created_at: "2020-01-01T00:00:00Z",
    ...extra,
  }) as GameCompletion;

describe("completionHistory", () => {
  it("runs oldest first, undated first of all, and marks the one being edited", () => {
    const nodes = completionHistory(
      [
        done(3, "2024-06-01T00:00:00Z"),
        done(1, "2019-03-14T00:00:00Z", {
          final_playtime_hrs: "38.0",
          platform: snes,
        }),
        done(2, null),
      ],
      3,
    );
    expect(nodes).toEqual([
      { completionId: 2, when: "No date", facts: "Main Story", current: false },
      { completionId: 1, when: "14 Mar 2019", facts: "Main Story · SNES · 38 h", current: false },
      { completionId: 3, when: "1 Jun 2024", facts: "Main Story", current: true },
    ]);
  });
});

describe("timesTag", () => {
  it("counts the new one after the earlier ones", () => {
    expect(timesTag(0)).toBeUndefined();
    expect(timesTag(1)).toBe("2nd time");
    expect(timesTag(2)).toBe("3rd time");
  });
});

describe("firstCompletionLine", () => {
  it("names the first completion for the phone's slip", () => {
    expect(
      firstCompletionLine([
        done(1, "2019-03-14T00:00:00Z", { platform: snes }),
      ]),
    ).toEqual({ when: "14 Mar 2019", rest: "Main Story on SNES" });
    expect(firstCompletionLine([])).toBeNull();
  });
});
