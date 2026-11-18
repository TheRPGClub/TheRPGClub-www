import { describe, expect, it } from "vitest";

import type { UpcomingBirthday } from "@/lib/api/birthdays";
import { birthdayLine } from "@/lib/dashboard/birthdays";

function upcoming(name: string, on: string, extra: Partial<UpcomingBirthday> = {}): UpcomingBirthday {
  const [, month, day] = on.split("-").map(Number);
  return {
    user_id: `id-${name}`,
    username: name.toLowerCase(),
    display_name: name,
    month,
    day,
    on,
    today: false,
    ...extra,
  };
}

describe("birthdayLine", () => {
  it("is hidden when nobody's Birthday is coming up", () => {
    expect(birthdayLine([], "2026-11-18")).toBeNull();
  });

  it("is hidden when the read failed", () => {
    expect(birthdayLine(null, "2026-11-18")).toBeNull();
  });

  it("is hidden when every Birthday it holds has already passed", () => {
    expect(birthdayLine([upcoming("Mara", "2026-11-17")], "2026-11-18")).toBeNull();
  });

  it("marks today's Birthdays and dates the rest by weekday, day and month", () => {
    const line = birthdayLine(
      [upcoming("Mara", "2026-11-18"), upcoming("Theo", "2026-11-21"), upcoming("juno.exe", "2026-12-02")],
      "2026-11-18",
    );
    expect(line).toEqual([
      { userId: "id-Mara", name: "Mara", when: "Today", today: true },
      { userId: "id-Theo", name: "Theo", when: "Sat 21 Nov", today: false },
      { userId: "id-juno.exe", name: "juno.exe", when: "Wed 2 Dec", today: false },
    ]);
  });

  it("says Tomorrow for the next club day, across the year end", () => {
    const line = birthdayLine([upcoming("Ines", "2027-01-01")], "2026-12-31");
    expect(line?.[0]).toMatchObject({ when: "Tomorrow", today: false });
  });

  it("dates a moved 29 February Birthday by the day it falls on", () => {
    const line = birthdayLine([upcoming("Pip", "2027-02-28", { month: 2, day: 29 })], "2027-02-20");
    expect(line?.[0].when).toBe("Sun 28 Feb");
  });

  it("drops a Birthday a stale read still holds from yesterday", () => {
    const line = birthdayLine([upcoming("Mara", "2026-11-17"), upcoming("Theo", "2026-11-18")], "2026-11-18");
    expect(line).toEqual([{ userId: "id-Theo", name: "Theo", when: "Today", today: true }]);
  });
});
