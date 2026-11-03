import type { SessionMembership } from "@/lib/auth-types";

// Role gates read from the session's `membership` flags, which the API keeps
// in step with the member's Discord roles (refreshed at sign-in and whenever
// the bot reports a role change). They mirror the API's named gates
// (app/controllers/concerns/staff_gates.rb) so the site hides or explains the
// controls a member can't use. They only shape the UI: the API makes the
// final decision on every request.
//
//   isSuperadmin        Superadmin (the `dev` flag)
//   isAdminOrAbove      Admin or Superadmin
//   isModeratorOrAbove  Moderator, Admin or Superadmin
//   hasRegularRole      Regulars role only
//   hasMemberRole       Members role only
//   isMemberOrStaff     Members role, or Moderator and above
//
// Like the API, the Regulars and Members gates check that one role. A feature
// that should also admit staff combines them, e.g.
// `hasRegularRole(m) || isAdminOrAbove(m)`.

type Flags = SessionMembership | null | undefined;

export function isSuperadmin(m: Flags): boolean {
  return m?.dev === true;
}

export function isAdminOrAbove(m: Flags): boolean {
  return m?.admin === true || isSuperadmin(m);
}

export function isModeratorOrAbove(m: Flags): boolean {
  return m?.moderator === true || isAdminOrAbove(m);
}

export function hasRegularRole(m: Flags): boolean {
  return m?.regular === true;
}

export function hasMemberRole(m: Flags): boolean {
  return m?.member === true;
}

// The API's `member_or_staff?` gate: the Members role, or Moderator and above.
// It admits the "any member" features: adding a game from IGDB, refreshing
// release info, HLTB lookup.
export function isMemberOrStaff(m: Flags): boolean {
  return hasMemberRole(m) || isModeratorOrAbove(m);
}

// The staff tiers, lowest first. A page or nav item names the tier it needs.
export type StaffTier = "moderator" | "admin" | "superadmin";

const TIER_GATE: Record<StaffTier, (m: Flags) => boolean> = {
  moderator: isModeratorOrAbove,
  admin: isAdminOrAbove,
  superadmin: isSuperadmin,
};

// Who a tier admits, for a refusal message ("Only Admins can ...").
export const TIER_AUDIENCE: Record<StaffTier, string> = {
  moderator: "Moderators, Admins and Superadmins",
  admin: "Admins and Superadmins",
  superadmin: "Superadmins",
};

export function canUseTier(m: Flags, tier: StaffTier): boolean {
  return TIER_GATE[tier](m);
}

// The `/admin` sections, each with the lowest tier that can use it. The
// sidebar's Staff group and the `/admin` overview list the ones the viewer
// passes. A section page checks the same tier with `canUseTier`.
export interface StaffSection {
  key: "overview" | "reminders" | "suggestions";
  href: string;
  label: string;
  tier: StaffTier;
  blurb: string;
}

export const STAFF_SECTIONS: readonly StaffSection[] = [
  {
    key: "overview",
    href: "/admin",
    label: "Staff desk",
    tier: "moderator",
    blurb: "Every staff tool your role can use.",
  },
  {
    key: "reminders",
    href: "/admin/reminders",
    label: "Public reminders",
    tier: "admin",
    blurb: "Schedule announcements in a club channel.",
  },
  {
    key: "suggestions",
    href: "/admin/suggestions",
    label: "Suggestion review",
    tier: "superadmin",
    blurb: "Approve Suggestions into GitHub issues, or reject them with a reason.",
  },
];

export function staffSectionsFor(m: Flags): StaffSection[] {
  return STAFF_SECTIONS.filter((s) => canUseTier(m, s.tier));
}

export function staffSection(key: StaffSection["key"]): StaffSection {
  const section = STAFF_SECTIONS.find((s) => s.key === key);
  if (!section) throw new Error(`Unknown staff section: ${key}`);
  return section;
}
