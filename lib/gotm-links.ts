// Outbound links shown on a GOTM / NR-GOTM card: the Reddit post, the game's
// Discord thread and the voting-results announcement. Mirrors the bot's
// `GotmSearchComponents.ts` link row.

export interface GotmCardLink {
  label: string;
  href: string;
}

export interface DiscordLinkConfig {
  guildId: string | null;
  announcementsChannelId: string | null;
}

// Server-only: neither var is NEXT_PUBLIC_, so call this from server
// components and pass the built links down.
export function discordLinkConfig(): DiscordLinkConfig {
  return {
    guildId: process.env.DISCORD_GUILD_ID || null,
    announcementsChannelId: process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID || null,
  };
}

export function gotmLinks(
  source: {
    redditUrl?: string | null;
    threadId?: string | null;
    votingResultsMessageId?: string | null;
  },
  config: DiscordLinkConfig = discordLinkConfig(),
): GotmCardLink[] {
  const links: GotmCardLink[] = [];
  const reddit = safeHttpUrl(source.redditUrl);
  if (reddit) links.push({ label: "Reddit", href: reddit });

  if (config.guildId && source.threadId) {
    links.push({
      label: "Thread",
      href: `https://discord.com/channels/${config.guildId}/${source.threadId}`,
    });
  }

  if (
    config.guildId &&
    config.announcementsChannelId &&
    source.votingResultsMessageId
  ) {
    links.push({
      label: "Voting results",
      href: `https://discord.com/channels/${config.guildId}/${config.announcementsChannelId}/${source.votingResultsMessageId}`,
    });
  }

  return links;
}

// The Reddit URL is free text from the database; only let http(s) through.
function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
