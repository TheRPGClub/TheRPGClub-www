import { describe, expect, it } from "vitest";

import type { Game } from "@/lib/api/types";
import { alternateVersion, versionsSection, type AlternateVersion, type VersionCall, type VersionsStage } from "./versions";
import { createGameEditSave, type StepResult } from "./engine";

// Alternate Versions through the save engine, with fake steps that record
// each call and fail on demand.
const save = createGameEditSave<{ versions: { loaded: AlternateVersion[]; staged: VersionsStage; call: VersionCall } }>(
  { versions: versionsSection },
  ["versions"],
);

function steps(failOn?: number) {
  const calls: VersionCall[] = [];
  const step = async (call: VersionCall): Promise<StepResult> => {
    calls.push(call);
    return call.altGameId === failOn ? { ok: false, error: "That game no longer exists." } : { ok: true };
  };
  return { calls, run: { "alternate.link": step, "alternate.unlink": step } };
}

const nes: AlternateVersion = { game_id: 2, title: "Dragon Quest III", year: 1988, platform: "NES", cover_url: null };
const sfc: AlternateVersion = { game_id: 3, title: "Dragon Quest III", year: 1996, platform: "Super Famicom", cover_url: null };
const gbc: AlternateVersion = { game_id: 4, title: "Dragon Quest III", year: 2001, platform: "Game Boy Color", cover_url: null };
const record = { versions: [nes, sfc] };
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };

describe("Alternate Versions", () => {
  it("makes no call for an empty stage", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, { versions: { link: [], unlink: [] } }, admin, run);
    expect(calls).toEqual([]);
    expect(outcome.sections).toEqual([]);
  });

  it("links a staged game and adds it to the record", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, { versions: { link: [gbc], unlink: [] } }, admin, run);
    expect(calls).toEqual([{ kind: "alternate.link", altGameId: 4 }]);
    expect(outcome.record.versions.map((v) => v.game_id)).toEqual([2, 3, 4]);
    expect(outcome.staged).toEqual({});
  });

  it("unlinks a staged version and drops it from the record", async () => {
    const { calls, run } = steps();
    const outcome = await save.run(record, { versions: { link: [], unlink: [2] } }, admin, run);
    expect(calls).toEqual([{ kind: "alternate.unlink", altGameId: 2 }]);
    expect(outcome.record.versions.map((v) => v.game_id)).toEqual([3]);
  });

  it("counts one change per link and unlink, ignoring ones that change nothing", () => {
    const stage = { versions: { link: [gbc, sfc], unlink: [2, 99] } };
    expect(save.changes(record, stage, admin)).toEqual({ total: 2, bySection: { versions: 2 } });
    expect(save.plan(record, stage, admin)[0].calls).toEqual([
      { kind: "alternate.unlink", altGameId: 2 },
      { kind: "alternate.link", altGameId: 4 },
    ]);
  });

  it("keeps only the calls that didn't go through staged when one fails", async () => {
    const { calls, run } = steps(4);
    const outcome = await save.run(record, { versions: { link: [gbc], unlink: [2] } }, admin, run);
    expect(calls).toEqual([
      { kind: "alternate.unlink", altGameId: 2 },
      { kind: "alternate.link", altGameId: 4 },
    ]);
    expect(outcome.sections).toEqual([
      { key: "versions", label: "Versions", status: "failed", error: "That game no longer exists." },
    ]);
    expect(outcome.staged).toEqual({ versions: { link: [gbc], unlink: [] } });
  });

  it("never plans a link or unlink for a Regular", async () => {
    const { calls, run } = steps();
    const stage = { versions: { link: [gbc], unlink: [2] } };
    expect(save.plan(record, stage, regular)).toEqual([]);
    await save.run(record, stage, regular, run);
    expect(calls).toEqual([]);
  });
});

describe("alternateVersion", () => {
  it("reads the row's year and first platform from a GameDB game", () => {
    const game = {
      game_id: 7,
      title: "Dragon Quest III",
      cover_url: "https://x/c.jpg",
      initial_release_date: "1988-02-10",
      platforms: [{ platform_name: "NES" }],
    } as unknown as Game;
    expect(alternateVersion(game)).toEqual({ game_id: 7, title: "Dragon Quest III", year: 1988, platform: "NES", cover_url: "https://x/c.jpg" });
    expect(alternateVersion({ ...game, initial_release_date: null, platforms: undefined })).toMatchObject({ year: null, platform: null });
  });
});
