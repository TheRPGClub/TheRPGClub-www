import { ArrowRight, ExternalLink } from "lucide-react";
import type { VotingCategory } from "@/lib/api/types";
import { ButtonLink } from "@/components/ui/button";
import { TRACK } from "@/components/issue/cover-track";
import type { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// A cover panel's action row: the game's page in the track's button, then
// the round's outside links (Reddit, the Discord thread, the results).
export function CoverActions({
  kind,
  href,
  links,
  small,
}: {
  kind: VotingCategory;
  href: string | null;
  links: ReturnType<typeof gotmLinks>;
  small: boolean;
}) {
  return (
    <div
      data-slot="cover-actions"
      className={cn(
        "flex flex-wrap items-center gap-x-1 gap-y-2",
        small ? "mt-3" : "mt-4",
      )}
    >
      {href && (
        <ButtonLink
          href={href}
          variant={TRACK[kind].button}
          className="mr-2"
        >
          View game
          <ArrowRight data-icon="inline-end" />
        </ButtonLink>
      )}
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          data-slot="cover-link"
          className="font-label inline-flex items-center gap-1 px-1.5 py-1 text-[0.85rem] text-dim-foreground transition-colors hover:text-highlight"
        >
          {link.label}
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      ))}
    </div>
  );
}
