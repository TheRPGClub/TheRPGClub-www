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
}

export interface AppSession {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
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
