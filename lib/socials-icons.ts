import type { ComponentType, SVGProps } from "react";
import PlaystationIcon from "@iconify-react/bi/playstation";
import XboxIcon from "@iconify-react/bi/xbox";
import NintendoSwitchIcon from "@iconify-react/bi/nintendo-switch";
import SteamIcon from "@iconify-react/bi/steam";
import BlueskyIcon from "@iconify-react/bi/bluesky";
import TwitterXIcon from "@iconify-react/bi/twitter-x";
import TwitterIcon from "@iconify-react/bi/twitter";
import YoutubeIcon from "@iconify-react/bi/youtube";
import TwitchIcon from "@iconify-react/bi/twitch";
import DiscordIcon from "@iconify-react/bi/discord";
import GithubIcon from "@iconify-react/bi/github";
import InstagramIcon from "@iconify-react/bi/instagram";
import FacebookIcon from "@iconify-react/bi/facebook";
import RedditIcon from "@iconify-react/bi/reddit";
import TiktokIcon from "@iconify-react/bi/tiktok";
import MastodonIcon from "@iconify-react/bi/mastodon";
import GlobeIcon from "@iconify-react/bi/globe";

export type SocialIcon = ComponentType<
  Omit<SVGProps<SVGSVGElement>, "viewBox" | "width" | "height" | "xmlns"> & {
    width?: string;
    height?: string;
  }
>;

const MATCHERS: { match: RegExp; icon: SocialIcon }[] = [
  { match: /\b(playstation|psn)\b/, icon: PlaystationIcon },
  { match: /\bxbox\b/, icon: XboxIcon },
  { match: /\b(nintendo|switch|nsw)\b/, icon: NintendoSwitchIcon },
  { match: /\bsteam\b/, icon: SteamIcon },
  { match: /\b(bluesky|bsky)\b/, icon: BlueskyIcon },
  { match: /\b(twitter\s*x|x\s*\(twitter\))\b/, icon: TwitterXIcon },
  { match: /\btwitter\b/, icon: TwitterIcon },
  { match: /\byoutube\b/, icon: YoutubeIcon },
  { match: /\btwitch\b/, icon: TwitchIcon },
  { match: /\bdiscord\b/, icon: DiscordIcon },
  { match: /\bgithub\b/, icon: GithubIcon },
  { match: /\b(instagram|insta)\b/, icon: InstagramIcon },
  { match: /\b(facebook|fb)\b/, icon: FacebookIcon },
  { match: /\breddit\b/, icon: RedditIcon },
  { match: /\btiktok\b/, icon: TiktokIcon },
  { match: /\bmastodon\b/, icon: MastodonIcon },
];

export function getSocialIcon(label: string | null | undefined): SocialIcon {
  const normalized = (label ?? "").toLowerCase().trim();
  for (const { match, icon } of MATCHERS) {
    if (match.test(normalized)) return icon;
  }
  return GlobeIcon;
}
