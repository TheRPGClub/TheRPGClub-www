import type { GuildChannel } from "@/lib/api/types";

// The picker label: "#name", with the category when there is one. Pure, so
// client pickers can use it too.
export function guildChannelLabel(channel: GuildChannel): string {
  return channel.category_name
    ? `#${channel.name} (${channel.category_name})`
    : `#${channel.name}`;
}
