import { describe, expect, it } from "vitest";
import { gotyRosettes } from "@/lib/games/goty-rosettes";

describe("gotyRosettes", () => {
  it("is empty for a game with no track and no Awards", () => {
    expect(gotyRosettes(null, undefined)).toEqual([]);
    expect(gotyRosettes(null, [])).toEqual([]);
  });

  it("keeps a plain monthly burst for a winner without an Award", () => {
    expect(gotyRosettes("gotm", [])).toEqual([{ burst: "gotm", award: null }]);
  });

  it("hangs the track's Award off its burst and gives Game of the Year a paper burst", () => {
    const rosettes = gotyRosettes("gotm", [
      { year: 2026, award: "gotm" },
      { year: 2026, award: "game_of_the_year" },
    ]);
    expect(rosettes).toEqual([
      { burst: "gotm", award: { year: 2026, name: "GOTM of the Year", tail: "GOTM of the Year" } },
      { burst: "goty", award: { year: 2026, name: "Game of the Year", tail: "" } },
    ]);
  });

  it("names the NR-GOTM Award on its tails", () => {
    expect(gotyRosettes("nr_gotm", [{ year: 2026, award: "nr_gotm" }])).toEqual([
      { burst: "nr_gotm", award: { year: 2026, name: "NR-GOTM of the Year", tail: "NR-GOTM of the Year" } },
    ]);
  });

  it("marks a Game of the Year that never won a month", () => {
    expect(gotyRosettes(null, [{ year: 2025, award: "game_of_the_year" }])).toEqual([
      { burst: "goty", award: { year: 2025, name: "Game of the Year", tail: "" } },
    ]);
  });

  it("gives every other Award its own rosette", () => {
    const rosettes = gotyRosettes("gotm", [
      { year: 2026, award: "gotm" },
      { year: 2025, award: "gotm" },
      { year: 2025, award: "nr_gotm" },
    ]);
    expect(rosettes.map((r) => [r.burst, r.award?.year])).toEqual([
      ["gotm", 2026],
      ["gotm", 2025],
      ["nr_gotm", 2025],
    ]);
  });
});
