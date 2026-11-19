import type { VotingPhase } from "@/lib/api/voting-round";
import type { FeatureView } from "@/lib/features";
import type { SidebarGroup, SidebarPage } from "@/lib/sidebar";
import { NavBadge } from "@/components/feature/preview-badge";
import { PHASE_LABEL } from "@/components/shell/nav-items";

// What the sidebar's parts share: the viewer's groups and Pinned Pages, the
// page they are on, the round's phase and their Feature view.
export interface SidebarNavModel {
  groups: SidebarGroup[];
  pinned: SidebarPage[];
  current: SidebarPage | null;
  // null when no round is scheduled or the read failed: the item keeps its
  // plain name rather than the nav breaking.
  votingPhase: VotingPhase | null;
  view: FeatureView;
}

// Nominations or the vote are live: the club has open business.
export function votingOpen(phase: VotingPhase | null): boolean {
  return phase === "nominating" || phase === "voting";
}

// The page's name; the voting page is named for the round's phase.
export function pageLabel(page: SidebarPage, phase: VotingPhase | null): string {
  return page.key === "voting" && phase ? PHASE_LABEL[phase] : page.label;
}

// The label with its Preview mark, for the rail's tooltip.
export function pageTooltip(page: SidebarPage, nav: SidebarNavModel): string {
  const label = pageLabel(page, nav.votingPhase);
  return page.feature && nav.view.preview(page.feature) ? `${label} (Preview)` : label;
}

// The yellow marks beside a page's name: Preview (staff only) and the
// voting page's Open while the round is.
export function PageBadges({
  page,
  nav,
  className,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
  className?: string;
}) {
  const preview = page.feature ? nav.view.preview(page.feature) : false;
  const open = page.key === "voting" && votingOpen(nav.votingPhase);
  if (!preview && !open) return null;
  return (
    <span className={className ?? "ml-auto flex gap-1"}>
      {preview && <NavBadge>Preview</NavBadge>}
      {open && <NavBadge>Open</NavBadge>}
    </span>
  );
}
