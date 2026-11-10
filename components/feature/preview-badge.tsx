import { Chip } from "@/components/issue/chip";

// Staff-only mark on a Preview Feature's page header: the highlight chip
// reading "Preview", so a Preview page is never mistaken (or screenshotted)
// for a Live one. Members never see a Preview Feature, so never this.
export function PreviewBadge({ className }: { className?: string }) {
  return (
    <Chip tone="highlight" className={className}>
      Preview
    </Chip>
  );
}

// The same mark at the sidebar's badge scale, beside the nav item's label
// (it shares the voting "Open" badge's slot and size). Hidden on the icon
// rail, where the tooltip says it instead.
export const NAV_BADGE_CLASS =
  "font-label rounded-xs bg-highlight px-1.5 py-px text-[0.7rem] font-extrabold text-ink group-data-[collapsible=icon]:hidden";
