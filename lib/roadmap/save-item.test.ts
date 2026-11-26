import { describe, expect, it, vi } from "vitest";
import { saveItemSteps } from "./save-item";
import type { RoadmapItem } from "./types";

const created: RoadmapItem = {
  id: 7,
  milestone_id: 1,
  title: "Roadmap",
  blurb: "A page.",
  area: null,
  github_issue_url: null,
  position: 1,
  shipped_at: null,
  feedback: [],
};

describe("saveItemSteps", () => {
  it("answers the created item when marking it Shipped fails, so a retry updates it", async () => {
    const write = vi.fn(async (item: RoadmapItem | null) => ({ ok: true as const, data: item ?? created }));
    const ship = vi.fn(async () => ({ ok: false as const, error: "Couldn't save that." }));

    const first = await saveItemSteps(null, true, write, ship);
    expect(first).toEqual({ error: "Couldn't save that.", item: created });

    await saveItemSteps(first.item, true, write, ship);
    expect(write).toHaveBeenNthCalledWith(1, null);
    expect(write).toHaveBeenNthCalledWith(2, created);
  });

  it("marks Shipped only when it differs, and answers the saved item", async () => {
    const shipped = { ...created, shipped_at: "2026-11-26T10:00:00Z" };
    const write = vi.fn(async () => ({ ok: true as const, data: created }));
    const ship = vi.fn(async () => ({ ok: true as const, data: shipped }));

    expect(await saveItemSteps(null, false, write, ship)).toEqual({ error: null, item: created });
    expect(ship).not.toHaveBeenCalled();
    expect(await saveItemSteps(null, true, write, ship)).toEqual({ error: null, item: shipped });
  });

  it("keeps the item it had when the first write fails", async () => {
    const write = vi.fn(async () => ({ ok: false as const, error: "Refused." }));
    const ship = vi.fn();

    expect(await saveItemSteps(created, false, write, ship)).toEqual({ error: "Refused.", item: created });
    expect(ship).not.toHaveBeenCalled();
  });
});
