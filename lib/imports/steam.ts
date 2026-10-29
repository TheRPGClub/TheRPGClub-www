import type { UserSocial } from "@/lib/api/types";
import { importErrorMessage } from "@/lib/imports/kinds";

// Steam-only helpers for the Steam import page. Client-safe.

// Steam's store header art for an app (460×215).
export const steamHeaderImageUrl = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

export const steamStoreUrl = (appId: number) =>
  `https://store.steampowered.com/app/${appId}/`;

// The member's linked Steam social, as something the API's `steam_profile`
// accepts: the profile URL when there is one, else the display text (a
// SteamID64 or vanity name). Empty when no Steam social is linked.
export function steamProfileFromSocials(socials: UserSocial[]): string {
  const steam = socials.find(
    (s) => s.social_platform?.label.trim().toLowerCase() === "steam",
  );
  if (!steam) return "";
  return (steam.url?.trim() || steam.display_text?.trim()) ?? "";
}

const STEAM_ERROR_MESSAGES: Record<string, string> = {
  invalid_identifier:
    "We couldn't find that Steam profile. Paste your profile URL, your SteamID64 or your custom URL name.",
  private_profile:
    "That Steam profile's game details are private. In Steam, set Privacy Settings → Game details to Public, then try again.",
  api_unavailable: "Steam didn't answer. Try again in a few minutes.",
  api_unauthorized: "The club's Steam connection isn't working right now. Let an admin know.",
  api_rate_limited: "Steam is busy right now. Wait a minute and try again.",
  steam_not_configured: "Steam imports aren't set up on this server yet. Let an admin know.",
};

export function steamImportErrorMessage(code: string | null | undefined, status?: number): string {
  if (code && STEAM_ERROR_MESSAGES[code]) return STEAM_ERROR_MESSAGES[code];
  return importErrorMessage(code, status);
}

// "12.5 h", or null when Steam reported no playtime.
export function formatPlaytime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours >= 100 ? Math.round(hours) : Math.round(hours * 10) / 10} h`;
}
