import { describe, expect, it } from "vitest";

import type { Release } from "@/lib/api/types";
import { releaseRows } from "./release-rows";
import { addRelease, deleteRelease, emptyReleaseDraft, releaseDraft } from "./releases";

const release = (over: Partial<Release>): Release => ({
  release_id: 1,
  game_id: 7,
  platform_id: 10,
  region_id: 1,
  format: null,
  notes: null,
  release_date: "2024-11-14",
  date_precision: "day",
  source: "igdb",
  platform_code: "SWITCH",
  platform_name: "Switch",
  region_code: "NA",
  region_name: "North America",
  ...over,
});

const igdb = release({});
const manual = release({ release_id: 2, source: "manual", region_id: 2, region_code: "EU" });
const pc = release({ release_id: 3, platform_id: 20, platform_name: "PC" });
const none = { added: [], edited: {}, deleted: [] };

describe("releaseRows", () => {
  it("groups Releases by platform in the API's order", () => {
    const groups = releaseRows([igdb, pc, manual], undefined);
    expect(groups.map((g) => [g.platformName, g.rows.map((r) => r.id)])).toEqual([
      ["Switch", ["r1", "r2"]],
      ["PC", ["r3"]],
    ]);
    expect(groups[0].rows.map((r) => r.source)).toEqual(["igdb", "manual"]);
  });

  it("marks staged deletes and puts new Releases in their platform, or first without one", () => {
    let stage = deleteRelease([igdb, manual], none, 2);
    stage = addRelease(stage, "a", { ...releaseDraft(manual), platform_id: 20, platform_name: "PC" });
    stage = addRelease(stage, "b", emptyReleaseDraft());
    const groups = releaseRows([igdb, manual, pc], stage);
    expect(groups.map((g) => [g.platformName, g.rows.map((r) => `${r.id}:${r.state}`)])).toEqual([
      ["", ["new:b:added"]],
      ["Switch", ["r1:saved", "r2:deleting"]],
      ["PC", ["r3:saved", "new:a:added"]],
    ]);
  });
});
