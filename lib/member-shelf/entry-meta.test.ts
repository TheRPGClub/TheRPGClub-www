import { describe, expect, it } from "vitest";

import type { MemberShelfEntry } from "@/lib/api/member-shelf-entry";
import { entryMeta } from "./entry-meta";

const platform = { platform_id: 1, platform_name: "PlayStation 2", platform_abbreviation: "PS2" };

const entry = (fields: Record<string, unknown>) => fields as unknown as MemberShelfEntry;

describe("entryMeta", () => {
  it("dates a completion by month and names its platform", () => {
    expect(
      entryMeta(
        "completed",
        entry({ completion_id: 1, completed_at: "2024-03-05T00:00:00Z", completion_type: "Main Story", platform }),
      ),
    ).toBe("Mar 2024 · PS2");
  });

  it("falls back to the completion type for an undated completion with no platform", () => {
    expect(
      entryMeta("completed", entry({ completion_id: 1, completed_at: null, completion_type: "Completionist" })),
    ).toBe("Completionist");
  });

  it("names a collection entry's platform and how it is owned", () => {
    expect(entryMeta("collection", entry({ ownership_type: "Physical", platform }))).toBe("PS2 · Physical");
  });

  it("uses the platform's full name when it has no abbreviation", () => {
    const named = { ...platform, platform_abbreviation: null };
    expect(entryMeta("backlog", entry({ backlog_id: 1, platform: named }))).toBe("PlayStation 2");
  });

  it("says nothing for an entry with no platform", () => {
    expect(entryMeta("favorite", entry({ favorite_id: 1 }))).toBeNull();
  });
});
