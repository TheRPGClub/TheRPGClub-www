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
