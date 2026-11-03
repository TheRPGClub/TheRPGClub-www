// Say as the bot (/admin/say): the rules the API's BotSay applies, so the
// form can say what's wrong before sending. The API checks them again.

// Discord's message length limit.
export const SAY_CONTENT_MAX = 2000;

// A Discord message link, as the API accepts it: discord.com, ptb., canary.
// or the old discordapp.com host, then guild, channel and message ids.
const MESSAGE_LINK =
  /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)\/?$/;

export interface MessageLink {
  guildId: string;
  channelId: string;
  messageId: string;
}

// The ids in a message link, or null when it isn't one.
export function parseMessageLink(link: string): MessageLink | null {
  const match = MESSAGE_LINK.exec(link.trim());
  if (!match) return null;
  return { guildId: match[1], channelId: match[2], messageId: match[3] };
}

export interface SayInput {
  channelId: string;
  content: string;
  // Blank means post, not reply.
  replyLink: string;
}

export interface SayProblems {
  channel?: string;
  content?: string;
  replyLink?: string;
}

// What's wrong with the form, by field; empty when it can be sent.
// `channelName` turns a channel id into "#general" for the link message.
export function validateSay(
  input: SayInput,
  channelName: (id: string) => string = (id) => id,
): SayProblems {
  const problems: SayProblems = {};
  if (!input.channelId.trim()) problems.channel = "Pick the channel to post in.";

  const content = input.content.trim();
  if (!content) problems.content = "Write the message.";
  else if (content.length > SAY_CONTENT_MAX) {
    problems.content = `Discord takes at most ${SAY_CONTENT_MAX} characters; this is ${content.length}.`;
  }

  const link = input.replyLink.trim();
  if (link) {
    const parsed = parseMessageLink(link);
    if (!parsed) {
      problems.replyLink =
        "That isn't a Discord message link. In Discord, open the message's menu and pick Copy Message Link.";
    } else if (input.channelId && parsed.channelId !== input.channelId) {
      problems.replyLink = `That message isn't in ${channelName(input.channelId)}. A reply goes in the message's own channel.`;
    }
  }
  return problems;
}

export function hasSayProblems(problems: SayProblems): boolean {
  return Object.values(problems).some(Boolean);
}
