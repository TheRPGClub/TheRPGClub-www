import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type { GiveawayTab } from "@/lib/giveaways";
import { ButtonLink } from "@/components/ui/button";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PageHeader } from "@/components/templates/page-header";
import { GiveawayTabs } from "@/components/giveaways/tabs/giveaway-tabs";

// The head of every giveaways tab: the title, Donate a key, and the tabs
// hanging from the rule like gift tags. A count is null when it couldn't be read.
export function GiveawaysHeader({
  active,
  counts,
  preview,
  children,
}: {
  active: GiveawayTab;
  counts: Record<GiveawayTab, number | null>;
  preview: boolean;
  children?: ReactNode;
}) {
  return (
    <div>
      <PageHeader
        title="Giveaways"
        badge={preview && <PreviewBadge />}
        actions={
          <ButtonLink href="/giveaways/donate" variant="highlight">
            <Plus data-icon="inline-start" />
            Donate a key
          </ButtonLink>
        }
      />
      <GiveawayTabs active={active} counts={counts} />
      {children}
    </div>
  );
}
