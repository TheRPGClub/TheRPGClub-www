import { describe, expect, it } from "vitest";

import type { BirthDate } from "@/lib/birth-date";
import { staffSavedLine, staffSharing } from "@/lib/staff-birth-date";

const doc = (birth_date: string | null, birthday_shared = false): BirthDate => ({
  user_id: "1",
  birth_date,
  birthday_shared,
  changes_left_this_month: 2,
  next_change_on: null,
});

describe("staffSharing", () => {
  it("lets staff turn a shared Birthday off, saying only the member can turn it back on", () => {
    expect(staffSharing(doc("1990-05-04", true), "Mira")).toEqual({
      shared: true,
      canTurnOff: true,
      line: "Members see 4 May on Mira's profile and in Upcoming Birthdays, and the bot greets them on the day. Once it's off, only Mira can turn it back on.",
    });
  });

  it("never lets staff turn sharing on", () => {
    expect(staffSharing(doc("05-04"), "Mira")).toEqual({
      shared: false,
      canTurnOff: false,
      line: "Not shared. Only Mira can turn it on, from their settings or /profile birth-date in Discord.",
    });
  });

  it("has nothing to share without a Birth Date", () => {
    expect(staffSharing(doc(null), "Mira")).toEqual({
      shared: false,
      canTurnOff: false,
      line: "Mira has no Birth Date, so there's no Birthday to share.",
    });
  });
});

describe("staffSavedLine", () => {
  it("confirms the saved date in words, with or without the year", () => {
    expect(staffSavedLine(doc("1990-05-04"), doc("1990-05-04"))).toBe("Saved: 4 May 1990.");
    expect(staffSavedLine(doc("1990-05-04"), doc("05-04"))).toBe("Saved: 4 May.");
  });

  it("says when removing it also stopped sharing the Birthday", () => {
    expect(staffSavedLine(doc("05-04", true), doc(null))).toBe("Removed. Their Birthday is no longer shared.");
    expect(staffSavedLine(doc("05-04"), doc(null))).toBe("Removed.");
  });

  it("confirms sharing was turned off", () => {
    expect(staffSavedLine(doc("05-04", true), doc("05-04"))).toBe("Their Birthday is no longer shared.");
  });
});
