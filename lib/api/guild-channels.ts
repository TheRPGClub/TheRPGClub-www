import { apiFetch } from "@/lib/api";
import type { GuildChannel, GuildChannelList } from "@/lib/api/types";

// The guild's text and announcement channels for a channel picker, in
// Discord's order. Null when the list can't be read, so a picker can say so
// rather than offer no channels. Server-only (reads the session cookie).
export async function fetchGuildChannels(): Promise<GuildChannel[] | null> {
  try {
    const res = await apiFetch("/api/v1/guild_channels", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as GuildChannelList;
    return body.data;
  } catch {
    return null;
  }
}

// The picker label: "#name", with the category when there is one.
export function guildChannelLabel(channel: GuildChannel): string {
  return channel.category_name
    ? `#${channel.name} (${channel.category_name})`
    : `#${channel.name}`;
}
