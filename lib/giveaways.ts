import type { GameKey, GameKeyRegion } from "@/lib/api/types";

// Giveaways: pure helpers for the prize shelf, the donate form and the claim
// results. Platforms are free text in the API (the bot takes "Steam", "Epic",
// "GOG", ...), so the shelf sorts each key onto a platform family by name.

export interface PlatformFamily {
  key: string;
  label: string;
  // The family's ribbon ink. Ink type sits on every one of them.
  ink: string;
}

// Platform inks: this page's own colours, kept off the GOTM red and NR violet.
export const PLATFORM_FAMILIES: readonly PlatformFamily[] = [
  { key: "steam", label: "Steam", ink: "#66c0f4" },
  { key: "gog", label: "GOG", ink: "#e8d9b0" },
  { key: "epic", label: "Epic", ink: "#f4f4f0" },
  { key: "playstation", label: "PlayStation", ink: "#4677e6" },
  { key: "xbox", label: "Xbox", ink: "#5fd08a" },
  { key: "switch", label: "Switch", ink: "#ff4fa3" },
  { key: "other", label: "Other", ink: "#b9b9b2" },
];

const OTHER = PLATFORM_FAMILIES[PLATFORM_FAMILIES.length - 1];

const MATCHERS: ReadonlyArray<[RegExp, string]> = [
  [/steam/i, "steam"],
  [/\bgog\b/i, "gog"],
  [/epic/i, "epic"],
  [/playstation|\bps[n345]?\b|\bps ?vita\b/i, "playstation"],
  [/xbox|microsoft store|game pass/i, "xbox"],
  [/switch|nintendo|\beshop\b/i, "switch"],
];

export function platformFamily(platform: string): PlatformFamily {
  for (const [pattern, key] of MATCHERS) {
    if (pattern.test(platform)) {
      return PLATFORM_FAMILIES.find((f) => f.key === key) ?? OTHER;
    }
  }
  return OTHER;
}

export function platformFamilyByKey(key: string | undefined): PlatformFamily | null {
  if (!key) return null;
  return PLATFORM_FAMILIES.find((f) => f.key === key) ?? null;
}

// One gift box: the same game, platform and region from the shelf, however
// many keys of it are on offer. Claiming takes the oldest key first.
export interface KeyBox {
  id: string;
  title: string;
  platform: string;
  region: GameKeyRegion;
  coverUrl: string | null;
  gameId: number | null;
  // Oldest first.
  keys: GameKey[];
}

export interface PlatformShelf {
  family: PlatformFamily;
  boxes: KeyBox[];
  count: number;
}

function boxId(key: GameKey): string {
  return [key.game_title.trim().toLowerCase(), key.platform.trim().toLowerCase(), key.region].join("|");
}

// Groups the shelf's keys into boxes and the boxes onto platform shelves, in
// the families' order. The API orders keys by title, so boxes keep that order.
export function buildShelves(keys: readonly GameKey[]): PlatformShelf[] {
  const byFamily = new Map<string, Map<string, KeyBox>>();
  for (const key of keys) {
    const family = platformFamily(key.platform).key;
    const boxes = byFamily.get(family) ?? new Map<string, KeyBox>();
    byFamily.set(family, boxes);
    const id = boxId(key);
    const box = boxes.get(id);
    if (box) {
      box.keys.push(key);
    } else {
      boxes.set(id, {
        id,
        title: key.game?.title ?? key.game_title,
        platform: key.platform,
        region: key.region,
        coverUrl: key.game?.cover_url ?? null,
        gameId: key.game?.game_id ?? key.gamedb_game_id ?? null,
        keys: [key],
      });
    }
  }
  return PLATFORM_FAMILIES.flatMap((family) => {
    const boxes = byFamily.get(family.key);
    if (!boxes) return [];
    const list = [...boxes.values()];
    for (const box of list) box.keys.sort((a, b) => a.key_id - b.key_id);
    return [{ family, boxes: list, count: list.reduce((n, b) => n + b.keys.length, 0) }];
  });
}

// A stable tilt (deg) for a hand-placed tag, within +-1.5deg.
export function tagTilt(seed: number): number {
  const steps = [-1.5, -1, -0.5, 0.5, 1, 1.5];
  return steps[Math.abs(seed) % steps.length];
}

// "AB12C-DE34F-GH56J" -> "•••••-•••••-GH56J": only the last group (or the last
// five characters) shows.
export function maskKey(value: string): string {
  const parts = value.split("-");
  if (parts.length > 1) {
    return [...parts.slice(0, -1).map((p) => "•".repeat(p.length)), parts[parts.length - 1]].join("-");
  }
  if (value.length <= 5) return "•".repeat(value.length);
  return "•".repeat(value.length - 5) + value.slice(-5);
}

// Where a key can be redeemed, when the platform has a plain redeem page.
export function redeemLink(platform: string, keyValue: string): { href: string; label: string } | null {
  const family = platformFamily(platform).key;
  if (family === "steam") {
    return {
      href: `https://store.steampowered.com/account/registerkey?key=${encodeURIComponent(keyValue)}`,
      label: "Redeem on Steam",
    };
  }
  if (family === "gog") return { href: "https://www.gog.com/redeem", label: "Redeem on GOG" };
  return null;
}

// The donate form.

export const GAME_KEY_REGIONS: readonly GameKeyRegion[] = ["Global", "NA", "EU", "UK", "RU/CIS", "Asia", "Unknown"];

// The platforms the form offers as one-tap choices; anything else is typed.
export const DONATE_PLATFORMS: readonly string[] = ["Steam", "GOG", "Epic", "PlayStation", "Xbox", "Switch"];

// Column limits in the API (and the bot's modal).
export const MAX_PLATFORM = 50;
export const MAX_KEY = 200;

// A donation names its game by GameDB id only: the API fills the title from
// the game.
export interface DonationInput {
  gamedb_game_id: number | null;
  platform: string;
  region: string;
  key_value: string;
}

export type DonationCheck =
  | { ok: true; data: { gamedb_game_id: number; platform: string; region: GameKeyRegion; key_value: string } }
  | { ok: false; error: string };

export function validateDonation(input: DonationInput): DonationCheck {
  const platform = input.platform.trim();
  const key = input.key_value.trim();
  const gameId = input.gamedb_game_id;
  if (gameId === null || !Number.isInteger(gameId) || gameId <= 0) {
    return { ok: false, error: "Pick the game from the GameDB." };
  }
  if (!platform) return { ok: false, error: "Say which platform the key is for." };
  if (platform.length > MAX_PLATFORM) return { ok: false, error: `The platform must be ${MAX_PLATFORM} characters or fewer.` };
  if (!key) return { ok: false, error: "Paste the key." };
  if (key.length > MAX_KEY) return { ok: false, error: `The key must be ${MAX_KEY} characters or fewer.` };
  const region = (GAME_KEY_REGIONS as readonly string[]).includes(input.region)
    ? (input.region as GameKeyRegion)
    : "Global";
  return { ok: true, data: { gamedb_game_id: gameId, platform, region, key_value: key } };
}

// The API's refusals of a donation's game, in words.
export const DONATION_GAME_ERRORS: Readonly<Record<string, string>> = {
  game_not_in_gamedb: "That game isn't in the GameDB. Search for it again, or add it from IGDB.",
  game_not_found: "That game is no longer in the GameDB. Pick it again.",
};

// The claim's refusals, by the API's status and code.
export type ClaimRefusal = "already_claimed" | "not_member" | "gone" | "signed_out" | "other";

export function claimRefusal(status: number, code: string | undefined): ClaimRefusal {
  if (status === 409 || code === "already_claimed") return "already_claimed";
  if (status === 403) return "not_member";
  if (status === 404) return "gone";
  if (status === 401) return "signed_out";
  return "other";
}

export const CLAIM_REFUSAL_COPY: Record<Exclude<ClaimRefusal, "other">, string> = {
  already_claimed: "Someone claimed it a moment before you. Pick another from the shelf.",
  not_member: "Claiming needs the Members role in Discord.",
  gone: "That key is no longer on the shelf. Its donor may have taken it back.",
  signed_out: "Sign in again to claim a key.",
};

// "today", "yesterday", "3 days ago", "last week", then a date.
export function shelfAge(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const day = 24 * 60 * 60 * 1000;
  const startOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const days = Math.round((startOf(now) - startOf(then)) / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 35) return `${Math.floor(days / 7)} weeks ago`;
  return shortDate(iso);
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
