import { describe, expect, it } from "vitest";

import type { GuildChannel } from "@/lib/api/types";
import { reminderChannelOptions } from "@/lib/public-reminders";

const channel = (channel_id: string, name: string, category_name: string | null = null) =>
  ({ channel_id, name, category_name }) as GuildChannel;

describe("reminderChannelOptions", () => {
  const channels = [channel("1", "general"), channel("2", "events", "Club")];

  it("lists the synced channels by their picker label", () => {
    expect(reminderChannelOptions(channels, null)).toEqual([
      { value: "1", label: "#general" },
      { value: "2", label: "#events (Club)" },
    ]);
  });

  it("keeps a stored channel the bot hasn't synced first, so an edit can keep it", () => {
    expect(reminderChannelOptions(channels, "9")[0]).toEqual({
      value: "9",
      label: "Current channel (9, not synced)",
    });
  });

  it("adds nothing for a stored channel that is synced", () => {
    expect(reminderChannelOptions(channels, "2")).toHaveLength(2);
  });
});
