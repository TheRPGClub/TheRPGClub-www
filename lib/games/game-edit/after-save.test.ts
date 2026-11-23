import { describe, expect, it } from "vitest";

import { recordAfterSave, stageAfterSave, withoutUnavailable, type GameEditOutcome } from "./after-save";
import type { GameEditRecord, GameEditStage } from "./index";

const record = {
  text: { description: "Old", featured_video_url: null },
  versions: [],
  threads: [],
} as unknown as GameEditRecord;

function outcome(over: Partial<GameEditOutcome>): GameEditOutcome {
  return { sections: [], staged: {}, record, ...over } as GameEditOutcome;
}

describe("stageAfterSave", () => {
  it("clears a saved section and keeps a failed one's remaining edits", () => {
    const clicked: GameEditStage = { text: { description: "New" }, versions: { link: [], unlink: [1, 2] } };
    const result = stageAfterSave(
      clicked,
      clicked,
      outcome({
        sections: [
          { key: "text", label: "Text & video", status: "saved" },
          { key: "versions", label: "Versions", status: "failed", error: "x" },
        ],
        staged: { versions: { link: [], unlink: [2] } },
      }),
    );
    expect(result).toEqual({ versions: { link: [], unlink: [2] } });
  });

  it("keeps edits staged after the click, in the saved section and in untouched ones", () => {
    const clicked: GameEditStage = { text: { description: "New" } };
    const later: GameEditStage = { text: { description: "Newer" }, threads: { link: [], unlink: ["9"] } };
    const result = stageAfterSave(later, clicked, outcome({ sections: [{ key: "text", label: "Text & video", status: "saved" }] }));
    expect(result).toEqual(later);
  });
});

describe("recordAfterSave", () => {
  it("takes only the saved sections from the outcome", () => {
    const saved = { ...record, text: { description: "New", featured_video_url: null } } as GameEditRecord;
    const current = { ...record, threads: [{ thread_id: "1", thread_name: "Fresh", jump_url: null }] } as GameEditRecord;
    const result = recordAfterSave(
      current,
      outcome({
        record: saved,
        sections: [
          { key: "text", label: "Text & video", status: "saved" },
          { key: "threads", label: "Game Threads", status: "failed", error: "x" },
        ],
      }),
    );
    expect(result.text.description).toBe("New");
    expect(result.threads).toEqual(current.threads);
  });
});

describe("withoutUnavailable", () => {
  it("drops the stage of a section that can't be edited", () => {
    const stage: GameEditStage = { text: { description: "New" }, versions: { link: [], unlink: [1] } };
    expect(withoutUnavailable(stage, { versions: "gone" })).toEqual({ text: { description: "New" } });
  });
});
