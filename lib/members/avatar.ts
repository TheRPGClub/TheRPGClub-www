import { discordAvatarUrl } from "@/lib/auth-types";

// A member's stored avatar as the browser loads it: the API's path
// (`/api/v1/users/<id>/avatar`) on the API's public address. Client-safe.
export function avatarSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3000"}${path}`;
}

export function memberAvatarPath(userId: string): string {
  return `/api/v1/users/${userId}/avatar`;
}

// The browser-ready avatar URL for a member: the one every avatar disc uses.
export function memberAvatarSrc(userId: string): string {
  return avatarSrc(memberAvatarPath(userId))!;
}

// A member's picture as the sidebar draws it: Discord's own image for the
// avatar hash from their last website login, which loads where the API's
// stored copy may not exist. Without a hash, the API's avatar endpoint.
// `size` is the pixels asked of Discord, which never upscales past the
// upload: 256 keeps every mark sharp on a 2x screen (most avatars are 256px
// at source, the same as the stored copy); the profile banner asks for 512.
export const MEMBER_PICTURE_SIZE = 256;
export function memberPictureSrc(
  member: { user_id: string; discord_avatar?: string | null },
  size = MEMBER_PICTURE_SIZE,
): string {
  return member.discord_avatar
    ? discordAvatarUrl(member.user_id, member.discord_avatar, size)
    : memberAvatarSrc(member.user_id);
}
