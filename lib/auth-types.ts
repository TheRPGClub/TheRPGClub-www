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
