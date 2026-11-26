import { describe, expect, it } from "vitest";

import type { BotJob } from "@/lib/api/types";
import {
  deskTabHref,
  deskTabsFor,
  groupTabNote,
  jobGroup,
  jobsTabNote,
  parseDeskTab,
  parseJobsShow,
  showsJob,
} from "@/lib/desk-tabs";
import { staffDeskFor } from "@/lib/staff";

const now = new Date("2026-11-23T12:00:00Z");

function job(over: Partial<BotJob>): BotJob {
  return {
    id: 1,
    kind: "memberscan",
    summary: "",
    status: "done",
    requested_by_user_id: null,
    attempts: 1,
    error_message: null,
    claimed_at: null,
    finished_at: null,
    created_at: "2026-11-23T10:00:00Z",
    updated_at: "2026-11-23T10:00:00Z",
    ...over,
  } as BotJob;
}

const superadmin = staffDeskFor({ dev: true } as never);
const moderator = staffDeskFor({ moderator: true } as never);
const group = (key: string) => superadmin.find((g) => g.key === key)!;

describe("deskTabsFor", () => {
  it("lists the viewer's job groups in order, then Bot jobs", () => {
    expect(deskTabsFor(superadmin)).toEqual(["voting", "bot", "members", "gamedb", "flags", "jobs"]);
    expect(deskTabsFor(moderator)).toEqual(["bot", "members", "jobs"]);
  });
});

describe("parseDeskTab and deskTabHref", () => {
  const tabs = deskTabsFor(moderator);
  it("opens the first tab for nothing, junk or a tab the viewer can't use", () => {
    expect(parseDeskTab(undefined, tabs)).toBe("bot");
    expect(parseDeskTab("nope", tabs)).toBe("bot");
    expect(parseDeskTab("voting", tabs)).toBe("bot");
    expect(parseDeskTab(["jobs", "bot"], tabs)).toBe("jobs");
  });

  it("keeps the first tab bare and Bot jobs' filter only on Bot jobs", () => {
    expect(deskTabHref("bot", tabs)).toBe("/admin");
    expect(deskTabHref("members", tabs)).toBe("/admin?tab=members");
    expect(deskTabHref("jobs", tabs, "failed")).toBe("/admin?tab=jobs&show=failed");
    expect(deskTabHref("members", tabs, "failed")).toBe("/admin?tab=members");
  });

  it("reads the filter leniently", () => {
    expect(parseJobsShow("queued")).toBe("queued");
    expect(parseJobsShow("FAILED")).toBe("all");
    expect(parseJobsShow(undefined)).toBe("all");
  });
});

describe("jobGroup", () => {
  it("files a job under the tab of the tool that queues it", () => {
    expect(jobGroup("presence_set")).toBe("bot");
    expect(jobGroup("memberscan")).toBe("members");
    expect(jobGroup("feature_flag_changed")).toBe("flags");
    expect(jobGroup("voting_results_publish")).toBe("voting");
  });

  it("files jobs no tool queues where they belong, or nowhere", () => {
    expect(jobGroup("voting_poll_wakeup")).toBe("voting");
    expect(jobGroup("feedback_submitted")).toBe("members");
    expect(jobGroup("giveaway_hub_refresh")).toBeNull();
  });
});

describe("showsJob", () => {
  const failed = job({ status: "failed", kind: "say" });
  const queued = job({ status: "claimed", kind: "memberscan" });
  it("narrows by status, then by tab", () => {
    expect(showsJob(failed, "failed", null)).toBe(true);
    expect(showsJob(queued, "failed", null)).toBe(false);
    expect(showsJob(queued, "queued", null)).toBe(true);
    expect(showsJob(failed, "all", "members")).toBe(false);
    expect(showsJob(failed, "all", "bot")).toBe(true);
  });
});

describe("groupTabNote", () => {
  const none = { pendingFeedback: null, jobs: [] };
  it("says the open round, live", () => {
    const note = groupTabNote(group("voting"), { voting: { text: "Round 143 open", tone: "live" } }, none, now);
    expect(note).toEqual({ note: "Round 143 open", tone: "live" });
  });

  it("puts pending Feedback, queued and failed jobs together, failures winning", () => {
    const note = groupTabNote(
      group("members"),
      { memberscan: { text: "Failed 1 h ago", tone: "bad" } },
      { pendingFeedback: 3, jobs: [job({ status: "queued", kind: "feedback_outcome" })] },
      now,
    );
    expect(note).toEqual({ note: "3 pending · 1 queued · 1 failed", tone: "bad" });
  });

  it("says when the flags last changed, and nothing for a quiet group", () => {
    const flags = groupTabNote(group("flags"), {}, { ...none, jobs: [job({ kind: "feature_flag_changed" })] }, now);
    expect(flags.note).toBe("Changed 2 h ago");
    expect(groupTabNote(group("gamedb"), {}, none, now)).toEqual({ note: "", tone: undefined });
  });
});

describe("jobsTabNote", () => {
  it("leads with failures, then what's waiting", () => {
    expect(jobsTabNote([job({ status: "failed" }), job({ status: "queued" })])).toEqual({ note: "1 failed", tone: "bad" });
    expect(jobsTabNote([job({ status: "queued" }), job({})])).toEqual({ note: "1 queued" });
    expect(jobsTabNote([job({})])).toEqual({ note: "All done" });
    expect(jobsTabNote([])).toEqual({ note: "None yet" });
  });
});
