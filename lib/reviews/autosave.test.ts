import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAutosave, type AutosaveStatus } from "@/lib/reviews/autosave";

function setup(results: boolean[] = []) {
  const saved: string[] = [];
  const statuses: AutosaveStatus[] = [];
  const save = vi.fn(async (snapshot: string) => {
    saved.push(snapshot);
    return results.length > 0 ? results.shift()! : true;
  });
  const autosave = createAutosave<string>({
    save,
    onStatus: (s) => statuses.push(s),
    delayMs: 1000,
    retryMs: 8000,
    now: () => Date.now(),
  });
  return { autosave, save, saved, statuses, last: () => statuses.at(-1) };
}

describe("createAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the writer to pause, then saves the latest snapshot once", async () => {
    const { autosave, saved, last } = setup();
    autosave.change("a");
    await vi.advanceTimersByTimeAsync(600);
    autosave.change("ab");
    await vi.advanceTimersByTimeAsync(600);
    expect(saved).toEqual([]);
    expect(last()).toEqual({ kind: "saving" });

    await vi.advanceTimersByTimeAsync(400);
    expect(saved).toEqual(["ab"]);
    expect(last()?.kind).toBe("saved");
    expect(autosave.dirty()).toBe(false);
  });

  it("reports a failure with its retry time, keeps the snapshot and retries", async () => {
    const { autosave, saved, last } = setup([false, true]);
    autosave.change("draft");
    await vi.advanceTimersByTimeAsync(1000);
    expect(saved).toEqual(["draft"]);
    expect(last()).toEqual({ kind: "failed", retryAt: Date.now() + 8000 });
    expect(autosave.dirty()).toBe(true);

    await vi.advanceTimersByTimeAsync(8000);
    expect(saved).toEqual(["draft", "draft"]);
    expect(last()?.kind).toBe("saved");
  });

  it("treats a thrown save as a failure", async () => {
    const statuses: AutosaveStatus[] = [];
    const autosave = createAutosave<string>({
      save: () => Promise.reject(new Error("offline")),
      onStatus: (s) => statuses.push(s),
      delayMs: 10,
    });
    autosave.change("x");
    await vi.advanceTimersByTimeAsync(10);
    expect(statuses.at(-1)?.kind).toBe("failed");
    autosave.dispose();
  });

  it("retries at once on retryNow", async () => {
    const { autosave, saved, last } = setup([false, true]);
    autosave.change("x");
    await vi.advanceTimersByTimeAsync(1000);
    autosave.retryNow();
    await vi.advanceTimersByTimeAsync(0);
    expect(saved).toEqual(["x", "x"]);
    expect(last()?.kind).toBe("saved");
  });

  it("saves a change made during a save straight after it", async () => {
    let release!: (ok: boolean) => void;
    const saved: string[] = [];
    const statuses: AutosaveStatus[] = [];
    const autosave = createAutosave<string>({
      save: (s) => {
        saved.push(s);
        return saved.length === 1 ? new Promise((r) => (release = r)) : Promise.resolve(true);
      },
      onStatus: (s) => statuses.push(s),
      delayMs: 1000,
    });
    autosave.change("one");
    await vi.advanceTimersByTimeAsync(1000);
    autosave.change("one two");
    release(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(statuses.at(-1)?.kind).toBe("saving");
    await vi.advanceTimersByTimeAsync(1000);
    expect(saved).toEqual(["one", "one two"]);
    expect(statuses.at(-1)?.kind).toBe("saved");
  });

  it("flush saves now and says whether everything reached the server", async () => {
    const { autosave, saved } = setup([true, false]);
    autosave.change("now");
    await expect(autosave.flush()).resolves.toBe(true);
    expect(saved).toEqual(["now"]);

    autosave.change("later");
    await expect(autosave.flush()).resolves.toBe(false);
    autosave.dispose();
  });

  it("flush with nothing unsaved is a no-op", async () => {
    const { autosave, save } = setup();
    await expect(autosave.flush()).resolves.toBe(true);
    expect(save).not.toHaveBeenCalled();
  });
});
