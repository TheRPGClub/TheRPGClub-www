// The club's permanent Discord invite, from the DISCORD_INVITE_URL setting.
// /join is the one page that needs it, and an Open the invite button that goes
// nowhere is worse than no page: without a usable setting this throws, and
// /join reads it when its module loads, so `next build` (collecting page data)
// and the server fail rather than ship a dead button.

export function discordInviteUrl(value = process.env.DISCORD_INVITE_URL): string {
  const invite = value?.trim();
  if (!invite) {
    throw new Error("DISCORD_INVITE_URL is not set: /join needs the club's permanent Discord invite.");
  }
  let url: URL;
  try {
    url = new URL(invite);
  } catch {
    throw new Error(`DISCORD_INVITE_URL is not a link: ${invite}`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`DISCORD_INVITE_URL must be an https link: ${invite}`);
  }
  return invite;
}
