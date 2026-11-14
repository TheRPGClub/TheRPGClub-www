import { describe, expect, it } from "vitest";

import type { Game, Platform } from "@/lib/api/types";
import { completionFormProblem, completionPlatformGroups, pickedGamePlatformId } from "@/lib/completions";

const platform = (platform_id: number, platform_name: string) => ({ platform_id, platform_name }) as Platform;
const ps1 = platform(1, "PlayStation");
const snes = platform(2, "SNES");
const pc = platform(3, "PC");
const game = (platforms: Platform[]) => ({ title: "Chrono Trigger", platforms }) as Game;

describe("completionPlatformGroups", () => {
  it("lists every platform under one heading before a game is picked", () => {
    expect(completionPlatformGroups([ps1, snes, pc], null)).toEqual([
      { label: "Platforms", options: [{ value: "1", label: "PlayStation" }, { value: "2", label: "SNES" }, { value: "3", label: "PC" }] },
    ]);
  });

  it("puts the game's own platforms first, under its title, then the others", () => {
    expect(completionPlatformGroups([ps1, snes, pc], game([snes, ps1]))).toEqual([
      { label: "Chrono Trigger is on", options: [{ value: "1", label: "PlayStation" }, { value: "2", label: "SNES" }] },
      { label: "Other platforms", options: [{ value: "3", label: "PC" }] },
    ]);
  });
});

describe("pickedGamePlatformId", () => {
  it("picks the game's platform when it has exactly one, else none", () => {
    expect(pickedGamePlatformId(game([snes]))).toBe("2");
    expect(pickedGamePlatformId(game([snes, ps1]))).toBe("");
    expect(pickedGamePlatformId(game([]))).toBe("");
  });
});

describe("completionFormProblem", () => {
  const ok = {
    hasMember: true,
    hasGame: true,
    dateChoice: "today" as const,
    customDate: "",
    playtimeOk: true,
    note: "",
  };

  it("passes a complete form", () => {
    expect(completionFormProblem(ok)).toBeNull();
  });

  it("asks for the member, then the game, then the date", () => {
    expect(completionFormProblem({ ...ok, hasMember: false, hasGame: false })).toBe("Pick a member first.");
    expect(completionFormProblem({ ...ok, hasGame: false })).toBe("Pick a game first.");
    expect(completionFormProblem({ ...ok, dateChoice: "custom", customDate: "2026-1-2" })).toBe(
      "Pick the date they finished it.",
    );
    expect(completionFormProblem({ ...ok, dateChoice: "custom", customDate: "2026-01-02" })).toBeNull();
  });

  it("refuses a bad playtime and a note over the limit", () => {
    expect(completionFormProblem({ ...ok, playtimeOk: false })).toBe(
      "Final playtime must be a non-negative number of hours.",
    );
    expect(completionFormProblem({ ...ok, note: `  ${"x".repeat(500)}  ` })).toBeNull();
    expect(completionFormProblem({ ...ok, note: "x".repeat(501) })).toBe("The note must be 500 characters or fewer.");
  });
});
