import type { FeatureKey, FeatureView } from "@/lib/features";

// The not-found and error pages' "Continued on" rows: where a reader picks
// up after a page that was torn out or didn't print.
export interface JumpLine {
  href: string;
  label: string;
  note: string;
  // The Feature the page needs, when one does.
  feature?: FeatureKey;
}

const MEMBER_JUMPS: readonly JumpLine[] = [
  { href: "/dashboard", label: "Dashboard", note: "This month's round, the vote and your panels" },
  { href: "/games", label: "Games", note: "Every game in the club's GameDB", feature: "game_index" },
  { href: "/members", label: "Members", note: "Profiles, shelves and reviews" },
  { href: "/gotm", label: "GOTM history", note: "Every round and every winner", feature: "voting_gotm" },
];

const VISITOR_JUMPS: readonly JumpLine[] = [
  { href: "/", label: "Front page", note: "What the club is and this month's pick" },
];

// A Member's rows, leaving out pages their Features hide; with no Features
// to read (an error page has no session) every row shows. A Visitor gets
// the front page.
export function jumpLines(viewer: "member" | "visitor", features?: FeatureView): readonly JumpLine[] {
  if (viewer === "visitor") return VISITOR_JUMPS;
  return MEMBER_JUMPS.filter((jump) => !jump.feature || !features || features.canOpen(jump.feature));
}
