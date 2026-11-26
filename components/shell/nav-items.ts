import {
  Award,
  Crown,
  BellRing,
  CalendarDays,
  ClipboardCheck,
  Flag,
  Gift,
  Layers,
  LayoutDashboard,
  Library,
  ListOrdered,
  Lightbulb,
  MessageSquareQuote,
  Newspaper,
  NotebookPen,
  Radio,
  Replace,
  ScrollText,
  ShieldCheck,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { SidebarGroupKey, SidebarPageKey } from "@/lib/sidebar";

export { isCurrent } from "@/lib/sidebar";

export type NavIcon = typeof LayoutDashboard;

export const DASHBOARD_HREF = "/dashboard";
export const SETTINGS_HREF = "/settings";

// Each page's icon, by its Pinned Page key (lib/sidebar.ts): a key without
// one is a type error.
export const PAGE_ICON: Record<SidebarPageKey, NavIcon> = {
  voting: Vote,
  gotm_history: Trophy,
  goty: Crown,
  challenges: Flag,
  games: Library,
  franchises: Layers,
  lists: ListOrdered,
  reviews: MessageSquareQuote,
  releases: CalendarDays,
  achievements: Award,
  journals: NotebookPen,
  members: Users,
  news: Newspaper,
  codex: ScrollText,
  giveaways: Gift,
  feedback: Lightbulb,
  staff_desk: ShieldCheck,
  voting_console: Vote,
  synonyms: Replace,
  live_events: Radio,
  public_reminders: BellRing,
  feedback_review: ClipboardCheck,
};

export const GROUP_ICON: Record<SidebarGroupKey, NavIcon> = {
  play: Trophy,
  games: Library,
  club: Users,
  staff: ShieldCheck,
};

// A 40px row in label type with an 18px icon: Dashboard, the Pinned Pages,
// the Browse groups and Settings share it, so nothing moves between them.
// The 11px inset puts the icon's center 28px from the sidebar's edge, the
// middle of the icon rail, in both states.
export const NAV_BUTTON_CLASS = "h-10 gap-3 pr-2.5 pl-[11px] text-[1.05rem] [&_svg]:size-[18px]";

// A tab on the phone's tab bar: an icon over its name, filling its cell.
export const TAB_CLASS = "h-full w-full min-w-0 flex-col items-center justify-center gap-1 px-1 [&_svg]:size-5";

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
