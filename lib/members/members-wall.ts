import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import type { User } from "@/lib/api/types";
import { fetchMembers } from "@/lib/api/shared";

// The club's contributor wall (/members): every current member with a club
// role, staff first, and the switch that narrows it to staff or regulars.

const FETCH_LIMIT = 500;

export type RoleKey = "admin" | "moderator" | "regular";
export type Show = "everyone" | "staff" | "regulars";

export interface WallMember {
  user: User;
  role: RoleKey;
}

const ROLE_ORDER: Record<RoleKey, number> = { admin: 0, moderator: 1, regular: 2 };

// The band a staff member's portrait carries; regulars carry none.
export const ROLE_BAND: Partial<Record<RoleKey, string>> = {
  admin: "Admin",
  moderator: "Moderator",
};

export const SHOW_OPTIONS: { value: Show; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "staff", label: "Staff" },
  { value: "regulars", label: "Regulars" },
];

function highestRole(user: User): RoleKey | null {
  if (user.role_admin) return "admin";
  if (user.role_moderator) return "moderator";
  if (user.role_regular) return "regular";
  return null;
}

export function memberDisplayName(user: User): string {
  return user.global_name ?? user.username ?? user.user_id;
}

export function parseShow(value: string | undefined): Show {
  return value === "staff" || value === "regulars" ? value : "everyone";
}

// The wall's members, or null when the API can't be read.
export async function fetchWallMembers(): Promise<WallMember[] | null> {
  try {
    const all = await fetchMembers<User>(`per=${FETCH_LIMIT}`, MEMBERS_REVALIDATE_SECONDS);
    if (!all) return null;
    const members: WallMember[] = [];
    for (const user of all) {
      if (user.is_bot || user.server_left_at) continue;
      const role = highestRole(user);
      if (role) members.push({ user, role });
    }
    // Staff first; the API's own order (by name) holds within a role.
    return members.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  } catch {
    return null;
  }
}

// How many members each choice of the switch shows, and those the chosen one
// shows.
export function wallView(
  members: WallMember[],
  show: Show,
): { counts: Record<Show, number>; shown: WallMember[] } {
  const staff = members.filter((m) => m.role !== "regular");
  const regulars = members.filter((m) => m.role === "regular");
  return {
    counts: { everyone: members.length, staff: staff.length, regulars: regulars.length },
    shown: show === "staff" ? staff : show === "regulars" ? regulars : members,
  };
}
