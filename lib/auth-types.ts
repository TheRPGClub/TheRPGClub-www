import type { SessionFeature } from "@/lib/features";

export interface SessionPrincipal {
  kind: string;
  id: string;
  discord_id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  service: boolean;
}

export interface SessionMembership {
  admin: boolean;
  moderator: boolean;
  regular: boolean;
  member: boolean;
  newcomer: boolean;
  active: boolean;
  dev: boolean;
  longstanding: boolean;
}

export interface AppSession {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
  // What this viewer may see (lib/features.ts). Optional only so a session
  // from an API without Feature Flags still reads as "everything shown".
  features?: SessionFeature[];
  // The member's Pinned Pages they can see right now, in their order (spec
  // api#416). Optional so a session from an API without them still reads as
  // the club default.
  pinned_pages?: string[];
  // Whether the member saved their own Pinned Pages rather than following
  // the club default (ticket api#419). Optional: missing reads as false.
  pinned_pages_customised?: boolean;
  // How many visible Pinned Pages the member has room for: the limit less
  // the pins they can't see right now, which the API keeps and counts.
  pinned_pages_room?: number;
  // The club default Pinned Pages and the limit; the API owns both (ADR
  // 0012). All three optional: an older API gets lib/pinned-pages' fallback.
  pinned_pages_default?: string[];
  pinned_pages_limit?: number;
  // The member's Patch Mark (api#512): whether a published Patch is past
  // it, and the newest Patch number seen (null before the first visit).
  // False / null unless Patch Notes is shown to the member. Optional: an
  // older API reads as nothing unseen (lib/patch-notes/patch-mark).
  patch_notes_unseen?: boolean;
  patch_mark?: number | null;
}

export function discordAvatarUrl(
  discordId: string,
  avatar: string | null,
  size = 128
): string {
  if (avatar) {
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=${size}`;
  }
  return `https://cdn.discordapp.com/embed/avatars/0.png`;
}
