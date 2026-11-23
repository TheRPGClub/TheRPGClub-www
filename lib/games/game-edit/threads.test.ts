import { describe, expect, it } from "vitest";

import { gameEditSave, type GameEditCall, type GameEditRecord, type GameEditSteps } from "./index";
import type { StepResult } from "./engine";
import { stageThreadLink, stageThreadUnlink, unstageThread, threadsView } from "./threads";

// Game Threads through the save module, with fake steps that record every
// call in order and fail the thread ids in `fail`. The record and steps hold
// Text & video and Game Threads only (cast), enough for a Regular's plan.
function steps(fail: string[] = []) {
  const calls: GameEditCall[] = [];
  const answer = (id: string): StepResult => (fail.includes(id) ? { ok: false, error: `Thread ${id} broke.` } : { ok: true });
  const run = {
    "game.update": async (call) => {
      calls.push(call);
      return { ok: true };
    },
    "thread.link": async (call) => {
      calls.push(call);
      return answer(call.thread.thread_id);
    },
    "thread.unlink": async (call) => {
      calls.push(call);
      return answer(call.threadId);
    },
  } as GameEditSteps;
  return { calls, run };
}

const one = { thread_id: "101", thread_name: "DQ3 HD-2D Remake", jump_url: "https://discord.com/channels/1/101" };
const two = { thread_id: "102", thread_name: "DQ3 spoilers", jump_url: null };
const record = {
  text: { description: "A hero sets out.", featured_video_url: null },
  threads: [one, two],
} as GameEditRecord;
const admin = { admin: true, threads: true };
const regular = { admin: false, threads: true };
const postgame = { thread_id: "201", thread_name: "DQ3 postgame" };

describe("Game Threads", () => {
  it("links a staged thread and unlinks a staged Game Thread, links first", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(record, { threads: { link: [postgame], unlink: ["102"] } }, admin, run);
    expect(calls).toEqual([
      { kind: "thread.link", thread: postgame },
      { kind: "thread.unlink", threadId: "102" },
    ]);
    expect(outcome.sections).toEqual([{ key: "threads", label: "Game Threads", status: "saved" }]);
    expect(outcome.record.threads.map((t) => t.thread_id)).toEqual(["101", "201"]);
    expect(outcome.staged).toEqual({});
  });

  it("counts one change per staged link and unlink", () => {
    expect(gameEditSave.changes(record, { threads: { link: [postgame], unlink: ["101", "102"] } }, regular)).toEqual({
      total: 3,
      bySection: { threads: 3 },
    });
  });

  it("makes no call for a link of a thread already linked or an unlink of one that isn't", async () => {
    const { calls, run } = steps();
    const outcome = await gameEditSave.run(
      record,
      { threads: { link: [{ thread_id: "101", thread_name: one.thread_name }], unlink: ["999"] } },
      admin,
      run,
    );
    expect(calls).toEqual([]);
    expect(outcome.sections).toEqual([]);
  });

  it("keeps only the calls that didn't go through staged when one fails", async () => {
    const { calls, run } = steps(["102"]);
    const other = { thread_id: "202", thread_name: "DQ3 speedruns" };
    const outcome = await gameEditSave.run(
      record,
      { threads: { link: [postgame, other], unlink: ["102", "101"] } },
      admin,
      run,
    );
    expect(calls).toHaveLength(3);
    expect(outcome.sections).toEqual([
      { key: "threads", label: "Game Threads", status: "failed", error: "Thread 102 broke." },
    ]);
    expect(outcome.staged).toEqual({ threads: { link: [], unlink: ["102", "101"] } });
  });

  it("gives a Regular a plan of thread calls only, even with other sections staged", async () => {
    const { calls, run } = steps();
    const stage = { text: { description: "New." }, threads: { link: [postgame], unlink: ["101"] } };
    const plan = gameEditSave.plan(record, stage, regular);
    expect(plan.map((p) => p.key)).toEqual(["threads"]);
    await gameEditSave.run(record, stage, regular, run);
    expect(calls.map((c) => c.kind)).toEqual(["thread.link", "thread.unlink"]);
  });
});

describe("staging Game Threads", () => {
  const loaded = [one, two];

  it("stages a link once, and a link of a Game Thread staged for unlink undoes the unlink", () => {
    let staged = stageThreadLink(loaded, undefined, postgame);
    staged = stageThreadLink(loaded, staged, postgame);
    expect(staged).toEqual({ link: [postgame], unlink: [] });
    staged = stageThreadUnlink(loaded, staged, "101");
    expect(staged).toEqual({ link: [postgame], unlink: ["101"] });
    expect(stageThreadLink(loaded, staged, { thread_id: "101", thread_name: one.thread_name })).toEqual({
      link: [postgame],
      unlink: [],
    });
  });

  it("drops the stage when the last staged change is undone", () => {
    const staged = stageThreadLink(loaded, undefined, postgame);
    expect(unstageThread(staged, "201")).toBeUndefined();
    expect(unstageThread(stageThreadUnlink(loaded, undefined, "102"), "102")).toBeUndefined();
  });

  it("lists the Game Threads with their staged marks, then the staged links", () => {
    const staged = { link: [postgame], unlink: ["102"] };
    expect(threadsView(loaded, staged)).toEqual([
      { ...one, mark: null },
      { ...two, mark: "unlinking" },
      { ...postgame, jump_url: null, mark: "added" },
    ]);
  });
});
