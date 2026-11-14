import {
  Award,
  BellRing,
  ClipboardCheck,
  Gift,
  LayoutDashboard,
  Library,
  Lightbulb,
  Newspaper,
  NotebookPen,
  Radio,
  Replace,
  ShieldCheck,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { FeatureKey } from "@/lib/features";
import type { StaffSection } from "@/lib/staff";

// The sidebar's items. Each item names the Feature it belongs to
// (lib/features.ts); the session says whether this viewer is shown it.
// Dashboard and Members are never flagged.
export const NAV_MAIN: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  feature?: FeatureKey;
}[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/games", icon: Library, label: "Games", feature: "game_index" },
  { href: "/gotm", icon: Trophy, label: "GOTM history", feature: "voting_gotm" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/journals", icon: NotebookPen, label: "Game Journals", feature: "journals" },
  { href: "/achievements", icon: Award, label: "Achievements", feature: "achievement_hub" },
  { href: "/news", icon: Newspaper, label: "News", feature: "news_hub" },
  { href: "/voting", icon: Vote, label: "Voting", feature: "voting_gotm" },
  { href: "/giveaways", icon: Gift, label: "Giveaways", feature: "giveaways" },
  // The board, open to every signed-in member; its "Suggest something"
  // button leads Members role holders and staff on to the form.
  {
    href: "/suggestions",
    icon: Lightbulb,
    label: "Suggestion Board",
    feature: "suggestions",
  },
];

export const VOTING_HREF = "/voting";
export const SETTINGS_HREF = "/settings";

// Icons for the sections marked `nav` in lib/staff.ts.
export const STAFF_ICON: Partial<Record<StaffSection["key"], typeof ShieldCheck>> = {
  overview: ShieldCheck,
  voting: Vote,
  synonyms: Replace,
  "live-events": Radio,
  reminders: BellRing,
  suggestions: ClipboardCheck,
};

export const NAV_BUTTON_CLASS = "h-10 gap-3 px-2.5 text-[1.05rem] [&_svg]:size-[18px]";

// The voting item is named for what the club is doing right now, so the nav
// says whether nominations or the vote are what's live without opening the
// page. Only the nomination window renames the item; a live vote, a finished
// round, and a missing or unreadable one all read as the section itself.
export const PHASE_LABEL: Record<VotingPhase, string> = {
  nominating: "Nominations",
  voting: "Voting",
  closed: "Voting",
  runoff: "Voting",
  tie: "Voting",
  decided: "Voting",
};

// The item for this path or one below it.
export function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
