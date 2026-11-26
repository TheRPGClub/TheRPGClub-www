import { describe, expect, it, vi } from "vitest";
import { readEveryPage } from "./pagination";

const page = (n: number, pages: number) => ({ data: [`row ${n}`], meta: { page: n, pages, count: pages } });

describe("readEveryPage", () => {
  it("reads every page the meta names, in order", async () => {
    const read = vi.fn(async (n: number) => page(n, 3));

    expect(await readEveryPage(read)).toEqual(["row 1", "row 2", "row 3"]);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it("stops at maxPages and reads one page without meta", async () => {
    expect(await readEveryPage(async (n) => page(n, 50), 2)).toEqual(["row 1", "row 2"]);
    expect(await readEveryPage(async () => ({ data: ["only"] }))).toEqual(["only"]);
  });

  it("fails when any page fails", async () => {
    expect(await readEveryPage(async (n) => (n === 2 ? null : page(n, 3)))).toBeNull();
    expect(await readEveryPage(async () => null)).toBeNull();
  });
});
