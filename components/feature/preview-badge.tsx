import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Staff-only mark on a Preview Feature's page header: the highlight chip
// reading "Preview", so a Preview page is never mistaken (or screenshotted)
// for a Live one. Members never see a Preview Feature, so never this.
export function PreviewBadge({ className }: { className?: string }) {
  return (
    <Badge tone="highlight" className={cn("border-0", className)}>
      Preview
    </Badge>
  );
}

// The same mark at the sidebar's badge scale, beside the nav item's label
// (the voting "Open" badge shares it). Hidden on the icon rail, where the
// tooltip says it instead.
export function NavBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge tone="highlight" size="nav" className="border-0 group-data-[collapsible=icon]:hidden">
      {children}
    </Badge>
  );
}
