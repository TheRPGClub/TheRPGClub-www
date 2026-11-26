import { describe, expect, it } from "vitest";

import { versionLine, versionRows, versionsValue } from "./versions";

describe("versionsValue", () => {
  it("is null until any repo has a version", () => {
    expect(versionsValue({ api: null, bot: null, www: null })).toBeNull();
    expect(versionsValue(null)).toBeNull();
    expect(versionsValue("1.0.0")).toBeNull();
    expect(versionsValue({ api: "", bot: 3, www: "  " })).toBeNull();
  });

  it("keeps the three versions as strings", () => {
    expect(versionsValue({ api: "1.12.0", bot: "2.9.1", www: "1.4.2", extra: "x" })).toEqual({
      api: "1.12.0",
      bot: "2.9.1",
      www: "1.4.2",
    });
    expect(versionsValue({ api: "1.0.0" })).toEqual({ api: "1.0.0", bot: null, www: null });
  });
});

describe("versionRows", () => {
  it("reads Site, API, Bot and skips the unset ones", () => {
    expect(versionRows({ api: "1.12.0", bot: "2.9.1", www: "1.4.2" }).map((r) => `${r.label} ${r.version}`)).toEqual([
      "Site 1.4.2",
      "API 1.12.0",
      "Bot 2.9.1",
    ]);
    expect(versionRows({ api: "1.0.0", bot: null, www: null }).map((r) => r.label)).toEqual(["API"]);
    expect(versionRows(null)).toEqual([]);
  });
});

describe("versionLine", () => {
  const all = { api: "1.12.0", bot: "2.9.1", www: "1.4.2" };

  it("names every set version by default", () => {
    expect(versionLine(all)).toBe("site 1.4.2 · api 1.12.0 · bot 2.9.1");
  });

  it("names only the given repos", () => {
    expect(versionLine(all, ["www", "api"])).toBe("site 1.4.2 · api 1.12.0");
    expect(versionLine({ api: null, bot: "2.9.1", www: null }, ["www", "api"])).toBeNull();
  });

  it("is null without versions", () => {
    expect(versionLine(null)).toBeNull();
  });
});
