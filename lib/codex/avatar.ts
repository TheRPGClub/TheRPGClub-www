// A member's stored avatar as the browser loads it: the API's path
// (`/api/v1/users/<id>/avatar`) on the API's public address. Client-safe.
export function avatarSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3000"}${path}`;
}

export function memberAvatarPath(userId: string): string {
  return `/api/v1/users/${userId}/avatar`;
}
