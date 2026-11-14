import type { Membership } from "@/lib/api/types";

// The member banner's words: Discord roles in rank order, and the join
// month.

export function roleList(membership: Membership | undefined | null): string[] {
  if (!membership) return [];
  const roles: string[] = [];
  if (membership.admin) roles.push("Admin");
  if (membership.dev) roles.push("Dev");
  if (membership.moderator) roles.push("Moderator");
  if (membership.regular) roles.push("Regular");
  if (membership.member) roles.push("Member");
  if (membership.longstanding) roles.push("Longstanding");
  if (membership.newcomer) roles.push("Newcomer");
  if (!membership.active) roles.push("Inactive");
  return roles;
}

export function joinedLabel(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
