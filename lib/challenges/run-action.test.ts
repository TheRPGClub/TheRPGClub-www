import { describe, expect, it } from "vitest";

import { runActionFor, runRefusal, runRequest, yourRunsOf } from "@/lib/challenges/run-action";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";

const challenge = (over: Partial<Challenge> = {}) =>
  ({
    id: 7,
    challenge_format: "pool",
    schedule: "always_open",
    season: null,
    ends_on: null,
    open: true,
    ...over,
  }) as Challenge;

const seasonal = {
  schedule: "seasonal" as const,
  season: { start: "09-22", end: "12-20", crosses_new_year: false },
};

const run = (id: number, over: Partial<ChallengeRun> = {}): ChallengeRun =>
  ({
    id,
    challenge: { id: 7, name: "Fall of Final Fantasy", challenge_format: "pool", schedule: "always_open" },
    user: { user_id: "me", username: "me" },
    status: "finished",
    started_at: "2026-09-23T14:00:00Z",
    window: { starts_on: "2026-09-22", ends_on: "2026-12-20" },
    progress: { in_progress: 0, cleared: 3, target: 3 },
    ...over,
  }) as ChallengeRun;

const today = "2026-11-17";

describe("runActionFor", () => {
  it("offers Start a Run to a member without one", () => {
    expect(runActionFor(challenge(), [], today)).toEqual({ kind: "start", again: false });
  });

  it("offers Abandon your Run while it is Active", () => {
    expect(runActionFor(challenge(), [run(3, { status: "active" })], today)).toEqual({ kind: "abandon", runId: 3 });
  });

  it("offers a new Run of an Always Open Challenge after a Finish", () => {
    expect(runActionFor(challenge(), [run(3)], today)).toEqual({ kind: "start", again: true });
  });

  it("offers no new Run inside a Season that already has the member's Run", () => {
    const c = challenge(seasonal);
    expect(runActionFor(c, [run(3, { status: "abandoned" })], today)).toEqual({ kind: "none" });
  });

  it("offers a new Run when the member's Run is from an earlier Season", () => {
    const c = challenge(seasonal);
    const last = run(3, { status: "expired", window: { starts_on: "2025-09-22", ends_on: "2025-12-20" } });
    expect(runActionFor(c, [last], today)).toEqual({ kind: "start", again: true });
  });

  it("says when a Closed Challenge opens", () => {
    const c = challenge({ ...seasonal, open: false });
    expect(runActionFor(c, [], "2027-01-10")).toEqual({ kind: "closed", reason: "Opens 22 Sep" });
  });

  it("still offers Abandon on a Closed Challenge with an Active Run", () => {
    const c = challenge({ open: false, ends_on: "2026-11-01" });
    expect(runActionFor(c, [run(4, { status: "active" })], today)).toEqual({ kind: "abandon", runId: 4 });
  });

  it("leaves an Assignment Challenge to its Edition's sign-up", () => {
    expect(runActionFor(challenge({ challenge_format: "assignment" }), [], today)).toEqual({ kind: "none" });
  });
});

describe("yourRunsOf", () => {
  it("keeps the viewer's Runs of the Challenge", () => {
    const other = run(2, { user: { user_id: "them", username: "them" } });
    const elsewhere = run(5, { challenge: { ...run(5).challenge, id: 9 } });
    expect(yourRunsOf([run(1), other, elsewhere], 7, "me").map((r) => r.id)).toEqual([1]);
  });
});

describe("runRequest", () => {
  it("starts a Run on the Challenge", () => {
    expect(runRequest({ kind: "start", challengeId: 7 })).toEqual({
      path: "/api/v1/challenges/7/runs",
      method: "POST",
    });
  });

  it("abandons and deletes the Run itself", () => {
    expect(runRequest({ kind: "abandon", runId: 3 })).toEqual({
      path: "/api/v1/challenge_runs/3/abandon",
      method: "POST",
    });
    expect(runRequest({ kind: "delete", runId: 3 })).toEqual({ path: "/api/v1/challenge_runs/3", method: "DELETE" });
  });

  it("refuses an id that isn't a positive whole number", () => {
    expect(runRequest({ kind: "delete", runId: 0 })).toBeNull();
    expect(runRequest({ kind: "start", challengeId: 1.5 })).toBeNull();
  });
});

describe("runRefusal", () => {
  it("shows the API's own message", () => {
    const body = { status: 409, code: "season_run_exists", message: "You've had your Run of this Season." };
    expect(runRefusal(body)).toBe("You've had your Run of this Season.");
  });

  it("falls back to a sentence per refusal", () => {
    expect(runRefusal({ status: 409, code: "challenge_closed" })).toBe("This Challenge is Closed just now.");
    expect(runRefusal({ status: 409, code: "birth_date_required" })).toMatch(/Birth Date/);
    expect(runRefusal({ status: 403 })).toBe("That isn't your Run.");
    expect(runRefusal({ status: 401 })).toBe("Your session has ended. Sign in again.");
  });
});
