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

// Each tier by name, for the desk's byline ("xergg · Superadmin").
export const TIER_NAME: Record<StaffTier, string> = {
  moderator: "Moderator",
  admin: "Admin",
  superadmin: "Superadmin",
};

// The desk's short form of TIER_AUDIENCE, beside each area's heading.
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

// The desk's areas, in the order its contents page lists them. Each area's
// tier is the lowest tier of its tools; an area shows when the viewer can use
// any tool in it.
export type StaffArea =
  | "voting"
  | "nominations"
  | "gamedb"
  | "mod"
  | "posts"
  | "features"
  | "superadmin";

export const STAFF_AREAS: readonly { key: StaffArea; label: string; tier: StaffTier }[] = [
  { key: "voting", label: "Voting", tier: "admin" },
  { key: "nominations", label: "Nominations", tier: "admin" },
  { key: "gamedb", label: "GameDB", tier: "admin" },
  { key: "mod", label: "Mod", tier: "moderator" },
  { key: "posts", label: "Posts", tier: "admin" },
  { key: "features", label: "Features", tier: "admin" },
  { key: "superadmin", label: "Superadmin", tier: "superadmin" },
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
  // The desk area it is listed under; null for the desk itself.
  area: StaffArea | null;
  // One line for the page header.
  blurb: string;
  // What the desk's contents page prints after the dot leader, where a
  // magazine prints the page number: a fixed note on the tool.
  hint: string;
  // Listed in the sidebar's Staff group too.
  nav?: boolean;
  // Takes the whole line on the desk (a long label).
  wide?: boolean;
  // Bot job kinds the tool queues. When the newest of them on the wire
  // failed, the desk shows "Failed 1 h ago" in place of the hint. A ticket
  // that adds a kind for its tool lists it here.
  jobKinds?: readonly BotJobKind[];
}

export const STAFF_SECTIONS: readonly StaffSection[] = [
  {
    key: "overview",
    href: "/admin",
    label: "Staff desk",
    tier: "moderator",
    area: null,
    blurb: "Every staff tool your role can use, beside the wire of bot jobs.",
    hint: "",
    nav: true,
  },
  {
    key: "voting",
    href: "/admin/voting",
    label: "Voting console",
    tier: "admin",
    area: "voting",
    blurb: "Run the current round: dates, the private tally, results and resets.",
    hint: "This round",
    nav: true,
    jobKinds: ["voting_results_publish", "voting_panels_repost", "voting_tie_broken"],
  },
  {
    key: "rounds",
    href: "/admin/rounds",
    label: "GOTM rounds",
    tier: "admin",
    area: "voting",
    blurb: "Add a GOTM or NR-GOTM round, or edit a round's games and Reddit URL.",
    hint: "Add or edit",
    jobKinds: ["gotm_cache_reload"],
  },
  {
    key: "nominations",
    href: "/admin/nominations",
    label: "Delete a nomination",
    tier: "admin",
    area: "nominations",
    blurb: "Remove a nomination with a reason; the bot posts the change.",
    hint: "With a reason",
    jobKinds: ["nomination_deleted"],
  },
  {
    key: "synonyms",
    href: "/admin/synonyms",
    label: "Synonyms",
    tier: "admin",
    area: "gamedb",
    blurb: "Search terms that find the same games.",
    hint: "Dictionary",
    nav: true,
  },
  {
    // Version linking lives in each game page's admin controls, so the desk
    // points at the games index rather than a page of its own.
    key: "versions",
    href: "/games",
    label: "Link versions",
    tier: "admin",
    area: "gamedb",
    blurb: "Link versions of a game from its game page.",
    hint: "By game",
  },
  {
    key: "presence",
    href: "/admin/presence",
    label: "Bot presence",
    tier: "moderator",
    area: "mod",
    blurb: "Set what the bot is playing, and see who set it before.",
    hint: "Set it",
    jobKinds: ["presence_set"],
  },
  {
    key: "presence-history",
    href: "/admin/presence#history",
    label: "Presence history",
    tier: "moderator",
    area: "mod",
    blurb: "Every presence the bot has had, with who set it.",
    hint: "Who set it",
  },
  {
    key: "live-events",
    href: "/admin/live-events",
    label: "Live events",
    tier: "moderator",
    area: "mod",
    blurb: "A forum thread and a Discord event for a stream or a play session.",
    hint: "Thread + event",
    nav: true,
    jobKinds: ["live_event_create"],
  },
  {
    key: "reminders",
    href: "/admin/reminders",
    label: "Public reminders",
    tier: "admin",
    area: "posts",
    blurb: "Schedule announcements in a club channel.",
    hint: "Scheduled posts",
    nav: true,
  },
  {
    key: "features",
    href: "/admin/features",
    label: "Feature Flags",
    tier: "admin",
    area: "features",
    blurb: "Set each Feature Off, Preview or Live for the site and the bot.",
    hint: "Off, Preview, Live",
    jobKinds: ["feature_flag_changed"],
  },
  {
    key: "say",
    href: "/admin/say",
    label: "Say as the bot",
    tier: "superadmin",
    area: "superadmin",
    blurb: "Post a message as the bot in any text channel, or reply to one.",
    hint: "Any channel",
    jobKinds: ["say"],
  },
  {
    key: "memberscan",
    href: "/admin/memberscan",
    label: "Memberscan",
    tier: "superadmin",
    area: "superadmin",
    blurb: "Re-read the guild's members and their roles.",
    hint: "Counts when done",
    jobKinds: ["memberscan"],
  },
  {
    key: "images",
    href: "/admin/images",
    label: "Download missing images",
    tier: "superadmin",
    area: "superadmin",
    blurb: "Fetch cover art for GameDB games that have none.",
    hint: "With progress",
    wide: true,
  },
  {
    key: "suggestions",
    href: "/admin/suggestions",
    label: "Suggestion review",
    tier: "superadmin",
    area: "superadmin",
    blurb: "Approve Suggestions into GitHub issues, or reject them with a reason.",
    hint: "Pending",
    nav: true,
    jobKinds: ["suggestion_outcome"],
  },
  {
    key: "completions",
    href: "/admin/completions",
    label: "Log a Game Completion for a member",
    tier: "superadmin",
    area: "superadmin",
    blurb: "Log a Game Completion on another member's behalf, and announce it.",
    hint: "With announce",
    wide: true,
    jobKinds: ["completion_announce"],
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

export interface StaffDeskArea {
  key: StaffArea;
  label: string;
  tier: StaffTier;
  sections: StaffSection[];
}

// The desk's contents page: the viewer's tools grouped by area, in area
// order, leaving out areas with nothing the viewer can use.
export function staffDeskFor(m: Flags): StaffDeskArea[] {
  const sections = staffSectionsFor(m);
  return STAFF_AREAS.map((area) => ({
    ...area,
    sections: sections.filter((s) => s.area === area.key),
  })).filter((area) => area.sections.length > 0);
}
