import { describe, expect, it } from "vitest";

import { importStartedDate } from "./kinds";

describe("importStartedDate", () => {
  it("names the day an import was started as month and day", () => {
    expect(importStartedDate("2026-11-03T12:00:00Z")).toBe("Nov 3");
  });
});
