import { describe, expect, it } from "vitest";

import type { BotJob } from "@/lib/api/types";
import { appendOlderJobs, mergeFirstPage } from "@/lib/bot-jobs";

const job = (id: number, status: BotJob["status"] = "done") => ({ id, status }) as BotJob;
const ids = (jobs: BotJob[]) => jobs.map((j) => [j.id, j.status]);

describe("mergeFirstPage", () => {
  it("takes the fresh first page and keeps the older pages loaded below it", () => {
    const current = [job(5, "queued"), job(4), job(3), job(2), job(1)];
    const fresh = [job(6), job(5), job(4)];
    expect(ids(mergeFirstPage(fresh, current))).toEqual([
      [6, "done"],
      [5, "done"],
      [4, "done"],
      [3, "done"],
      [2, "done"],
      [1, "done"],
    ]);
  });

  it("drops a job the fresh page passed over (newer than its oldest)", () => {
    const current = [job(9), job(7), job(2)];
    expect(ids(mergeFirstPage([job(9), job(8), job(5)], current)).map(([id]) => id)).toEqual([9, 8, 5, 2]);
  });

  it("keeps everything loaded when the first page comes back empty", () => {
    expect(ids(mergeFirstPage([], [job(2), job(1)])).map(([id]) => id)).toEqual([2, 1]);
  });
});

describe("appendOlderJobs", () => {
  it("adds the next page under the list, skipping jobs already on it", () => {
    expect(appendOlderJobs([job(5), job(4)], [job(4), job(3)]).map((j) => j.id)).toEqual([5, 4, 3]);
  });
});
