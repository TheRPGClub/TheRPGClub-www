import type { User } from "@/lib/api/types";

// A review's author as review surfaces name them: the display name, then the
// username, then the caller's fallback. Client-safe.
export function reviewerName(
  user: Pick<User, "global_name" | "username"> | null | undefined,
  fallback: string,
): string {
  return user?.global_name ?? user?.username ?? fallback;
}
