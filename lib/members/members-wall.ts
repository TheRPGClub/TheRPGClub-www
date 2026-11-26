import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import type { User } from "@/lib/api/types";
import { fetchMembers } from "@/lib/api/shared";

// The club's members page (/members): every current member with a club role,
// in tiers by their highest role. Every member is drawn alike; only the tier
// they sit in says their role.

const FETCH_LIMIT = 500;

export type RoleKey = "admin" | "moderator" | "dev" | "regular" | "member" | "newcomer";

// Highest first: a member sits in the tier of the first role they hold.
export const ROLES: { key: RoleKey; label: string; tier: string }[] = [
  { key: "admin", label: "Admin", tier: "Admins" },
  { key: "moderator", label: "Moderator", tier: "Moderators" },
  { key: "dev", label: "Dev", tier: "Devs" },
  { key: "regular", label: "Regular", tier: "Regulars" },
  { key: "member", label: "Member", tier: "Members" },
  { key: "newcomer", label: "Newcomer", tier: "Newcomers" },
];

const HOLDS: Record<RoleKey, (user: User) => boolean | undefined> = {
  admin: (u) => u.role_admin,
  moderator: (u) => u.role_moderator,
  dev: (u) => u.role_dev,
  regular: (u) => u.role_regular,
  member: (u) => u.role_member,
  newcomer: (u) => u.role_newcomer,
};

export interface WallMember {
  userId: string;
  name: string;
  username: string | null;
  // Every role they hold, highest first; the first is their tier.
  roles: string[];
}

export interface Tier {
  key: RoleKey;
  title: string;
  members: WallMember[];
}

export function memberDisplayName(user: Pick<User, "global_name" | "username" | "user_id">): string {
  return user.global_name ?? user.username ?? user.user_id;
}

// The tiers, highest first, leaving out any with nobody in it. The API's own
// order (by name) holds within a tier.
export function wallTiers(users: User[]): Tier[] {
  const tiers = new Map<RoleKey, WallMember[]>(ROLES.map((r) => [r.key, []]));
  for (const user of users) {
    if (user.is_bot || user.server_left_at) continue;
    const held = ROLES.filter((r) => HOLDS[r.key](user));
    if (held.length === 0) continue;
    tiers.get(held[0].key)!.push({
      userId: user.user_id,
      name: memberDisplayName(user),
      username: user.username,
      roles: held.map((r) => r.label),
    });
  }
  return ROLES.map((r) => ({ key: r.key, title: r.tier, members: tiers.get(r.key)! })).filter(
    (t) => t.members.length > 0,
  );
}

// The page's tiers, or null when the API can't be read.
export async function fetchWallTiers(): Promise<Tier[] | null> {
  try {
    const all = await fetchMembers<User>(`per=${FETCH_LIMIT}`, MEMBERS_REVALIDATE_SECONDS);
    return all ? wallTiers(all) : null;
  } catch {
    return null;
  }
}

// The tiers narrowed to members whose name or username holds the query.
export function searchTiers(tiers: Tier[], query: string): Tier[] {
  const q = query.trim().toLowerCase();
  if (!q) return tiers;
  return tiers
    .map((t) => ({
      ...t,
      members: t.members.filter(
        (m) => m.name.toLowerCase().includes(q) || (m.username ?? "").toLowerCase().includes(q),
      ),
    }))
    .filter((t) => t.members.length > 0);
}
