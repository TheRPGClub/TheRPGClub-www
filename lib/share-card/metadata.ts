import type { Metadata } from "next";
import type { PublicWinner } from "@/lib/api/types";
import { siteOrigin } from "@/lib/site-origin";
import { shareCardImagePath } from "./select";

// The site-wide metadata the root layout sets (spec api#518): the title, the
// description, and the Share Card as a large Open Graph / X image. The image
// URL is made absolute against the site origin; in development without
// SITE_URL Next falls back to localhost.

export const SITE_NAME = "The RPG Club";
export const SITE_DESCRIPTION =
  "A Discord club for RPG players: vote a Game of the Month together, track your backlog and completions, write reviews, and chase Challenges with friends.";
export const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const;
export const SHARE_CARD_ALT = "The RPG Club: an RPG and a wildcard, every month. Played together.";

type Env = Readonly<Record<string, string | undefined>>;

export function shareCardMetadata(winners: PublicWinner[], env: Env): Metadata {
  const origin = siteOrigin(env, null);
  const image = { url: shareCardImagePath(winners), ...SHARE_CARD_SIZE, alt: SHARE_CARD_ALT };
  return {
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [image],
    },
  };
}
