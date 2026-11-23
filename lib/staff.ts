import type { BotJobKind } from "@/lib/api/types";
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
//   isRegularOrStaff    Regulars role, or Moderator and above
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

// The API's `regular_or_staff?` gate: the Regulars role, or Moderator and
// above. It admits linking and unlinking a game's Discord threads.
export function isRegularOrStaff(m: Flags): boolean {
  return hasRegularRole(m) || isModeratorOrAbove(m);
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

// The short form of TIER_AUDIENCE, for a desk page's note and the
// desk's tool chips.
export const TIER_SHORT: Record<StaffTier, string> = {
  moderator: "Moderators and up",
  admin: "Admins",
  superadmin: "Superadmins",
};

// The highest tier the member passes, or null when they aren't staff.
export function staffTierOf(m: Flags): StaffTier | null {
  if (isSuperadmin(m)) return "superadmin";
  if (isAdminOrAbove(m)) return "admin";
  if (isModeratorOrAbove(m)) return "moderator";
  return null;
}

// The desk's groups, by the job a tool does, in the order the desk's tabs
// list them (design pick, 2026-11-23). Each group's tier is the lowest tier
// of its tools; a group shows when the viewer can use any tool in it.
export type StaffGroup = "voting" | "bot" | "members" | "gamedb" | "flags";

export const STAFF_GROUPS: readonly { key: StaffGroup; label: string; tier: StaffTier }[] = [
  { key: "voting", label: "Voting", tier: "admin" },
  { key: "bot", label: "The bot", tier: "moderator" },
  { key: "members", label: "Members", tier: "moderator" },
  { key: "gamedb", label: "GameDB", tier: "admin" },
  { key: "flags", label: "Feature Flags", tier: "admin" },
];

export type StaffSectionKey =
  | "overview"
  | "voting"
  | "rounds"
  | "nominations"
  | "synonyms"
  | "versions"
  | "presence"
  | "presence-history"
  | "live-events"
  | "birth-dates"
  | "reminders"
  | "say"
  | "memberscan"
  | "images"
  | "suggestions"
  | "completions"
  | "features";

// The `/admin` sections, each with the lowest tier that can use it. The desk
// (`/admin`) lists the ones the viewer passes, grouped by area; the sidebar's
// Staff group shows the ones marked `nav`. A section page checks the same
// tier with `canUseTier` and refuses with <StaffOnly> otherwise.
export interface StaffSection {
  key: StaffSectionKey;
  href: string;
  label: string;
  tier: StaffTier;
  // The desk group (tab) it is listed under; null for the desk itself.
  group: StaffGroup | null;
  // One line for the page header.
  blurb: string;
  // The desk's one line on what the tool does, under its name.
  line: string;
  // Listed in the sidebar's Staff group too.
  nav?: boolean;
  // Bot job kinds the tool queues: its jobs show in its tab's Recent bot
  // jobs, and when the newest of them failed the desk says "Failed 1 h ago"
  // beside the tool. A ticket that adds a kind for its tool lists it here.
  jobKinds?: readonly BotJobKind[];
}

// In desk order: each group's tools as its tab lists them.
export const STAFF_SECTIONS: readonly StaffSection[] = [
  {
    key: "overview",
    href: "/admin",
    label: "Staff desk",
    tier: "moderator",
    group: null,
    blurb: "What's waiting on the desk, every staff tool your role can use, and the bot's jobs.",
    line: "",
    nav: true,
  },
  // Voting
  {
    key: "voting",
    href: "/admin/voting",
    label: "Voting console",
    tier: "admin",
    group: "voting",
    blurb: "Run the current round: dates, the private tally, results and resets.",
    line: "Run this round: its dates, the private tally, results and resets.",
    nav: true,
    jobKinds: ["voting_results_publish", "voting_panels_repost", "voting_tie_broken"],
  },
  {
    key: "rounds",
    href: "/admin/rounds",
    label: "GOTM rounds",
    tier: "admin",
    group: "voting",
    blurb: "Add a GOTM or NR-GOTM round, or edit a round's games and Reddit URL.",
    line: "Add a GOTM or NR-GOTM round, or fix a round's games and Reddit link.",
    jobKinds: ["gotm_cache_reload"],
  },
  {
    key: "nominations",
    href: "/admin/nominations",
    label: "Delete a nomination",
    tier: "admin",
    group: "voting",
    blurb: "Remove a nomination with a reason; the bot posts the change.",
    line: "Take a nomination out of the round with a reason; the bot posts the change.",
    jobKinds: ["nomination_deleted"],
  },
  // The bot
  {
    key: "say",
    href: "/admin/say",
    label: "Say as the bot",
    tier: "superadmin",
    group: "bot",
    blurb: "Post a message as the bot in any text channel, or reply to one.",
    line: "Post as the bot in any text channel, or reply to a message.",
    jobKinds: ["say"],
  },
  {
    key: "presence",
    href: "/admin/presence",
    label: "Bot status",
    tier: "moderator",
    group: "bot",
    blurb: "Set what the bot is playing, and see who set it before.",
    line: "Set what the bot is playing.",
    jobKinds: ["presence_set"],
  },
  {
    key: "presence-history",
    href: "/admin/presence#history",
    label: "Status history",
    tier: "moderator",
    group: "bot",
    blurb: "Every status the bot has had, with who set it.",
    line: "Every status the bot has had, and who set it.",
  },
  {
    key: "reminders",
    href: "/admin/reminders",
    label: "Scheduled posts",
    tier: "admin",
    group: "bot",
    blurb: "Schedule announcements in a club channel.",
    line: "Announcements the bot posts in a club channel on a schedule.",
    nav: true,
  },
  {
    key: "live-events",
    href: "/admin/live-events",
    label: "Live events",
    tier: "moderator",
    group: "bot",
    blurb: "A forum thread and a Discord event for a stream or a play session.",
    line: "A forum thread and a Discord event for a stream or a play session.",
    nav: true,
    jobKinds: ["live_event_create"],
  },
  // Members
  {
    key: "birth-dates",
    href: "/admin/birth-dates",
    label: "Set a Birth Date",
    tier: "moderator",
    group: "members",
    blurb:
      "Set or remove a member's Birth Date, with or without the year, or stop them sharing their Birthday. Staff changes don't count toward their two a month.",
    line: "Set or remove a member's Birth Date; staff changes don't count toward their two a month.",
  },
  {
    key: "completions",
    href: "/admin/completions",
    label: "Add a Game Completion",
    tier: "superadmin",
    group: "members",
    blurb: "Log a Game Completion on another member's behalf, and announce it.",
    line: "Log a Game Completion on a member's behalf, and announce it.",
    jobKinds: ["completion_announce"],
  },
  {
    key: "memberscan",
    href: "/admin/memberscan",
    label: "Recount members",
    tier: "superadmin",
    group: "members",
    blurb: "Re-read the server's members and their roles; the bot reports the counts.",
    line: "Re-read the server's members and their roles, and report the counts.",
    jobKinds: ["memberscan"],
  },
  {
    key: "suggestions",
    href: "/admin/suggestions",
    label: "Review Suggestions",
    tier: "superadmin",
    group: "members",
    blurb: "Approve Suggestions into GitHub issues, or reject them with a reason.",
    line: "Approve Suggestions into GitHub issues, or reject them with a reason.",
    nav: true,
    jobKinds: ["suggestion_outcome"],
  },
  // GameDB
  {
    key: "synonyms",
    href: "/admin/synonyms",
    label: "Game synonyms",
    tier: "admin",
    group: "gamedb",
    blurb: "Search terms that find the same games.",
    line: "Search terms that find the same games.",
    nav: true,
  },
  {
    // Version linking lives in each game page's admin controls, so the desk
    // points at the games index rather than a page of its own.
    key: "versions",
    href: "/games",
    label: "Game versions",
    tier: "admin",
    group: "gamedb",
    blurb: "Link versions of a game from its game page.",
    line: "Link a game's versions together, from its game page.",
  },
  {
    key: "images",
    href: "/admin/images",
    label: "Missing images",
    tier: "superadmin",
    group: "gamedb",
    blurb: "Fetch cover art for GameDB games that have none.",
    line: "Fetch cover art for GameDB games that have none.",
  },
  // Feature Flags
  {
    key: "features",
    href: "/admin/features",
    label: "Feature Flags",
    tier: "admin",
    group: "flags",
    blurb: "Set each Feature Off, Preview or Live for the site and the bot.",
    line: "Set each Feature Off, Preview or Live, for the site and the bot.",
    jobKinds: ["feature_flag_changed"],
  },
];

export function staffSectionsFor(m: Flags): StaffSection[] {
  return STAFF_SECTIONS.filter((s) => canUseTier(m, s.tier));
}

export function staffSection(key: StaffSectionKey): StaffSection {
  const section = STAFF_SECTIONS.find((s) => s.key === key);
  if (!section) throw new Error(`Unknown staff section: ${key}`);
  return section;
}

export interface StaffDeskGroup {
  key: StaffGroup;
  label: string;
  tier: StaffTier;
  sections: StaffSection[];
}

// The desk's job groups the viewer can use, each with their tools, in tab
// order, leaving out groups with nothing the viewer can use.
export function staffDeskFor(m: Flags): StaffDeskGroup[] {
  const sections = staffSectionsFor(m);
  return STAFF_GROUPS.map((group) => ({
    ...group,
    sections: sections.filter((s) => s.group === group.key),
  })).filter((group) => group.sections.length > 0);
}
