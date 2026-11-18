"use client";

import { X } from "lucide-react";
import type { CodexEntryLink } from "@/lib/codex/types";
import { Button } from "@/components/ui/button";
import { PartLabel } from "./part-label";

// The linked entries on a form (5D's See also card): full-width chips, each
// its part in its ink, the title or a Fun Fact's opening words cut with an
// ellipsis, and a remove x. Removing one unlinks it from both entries on
// save.
export function SeeAlsoChips({
  links,
  onRemove,
}: {
  links: readonly CodexEntryLink[];
  onRemove: (id: number) => void;
}) {
  if (links.length === 0) return null;
  return (
    <ul aria-label="Linked entries" className="mb-2.5 flex flex-col gap-2">
      {links.map((link) => (
        <li
          key={link.id}
          className="flex h-8 min-w-0 items-center gap-2 rounded-[2.4px] bg-card pr-1 pl-2.5 text-[0.9rem] shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
        >
          <PartLabel part={link.part} />
          <span className="min-w-0 flex-1 truncate" title={link.title}>
            {link.title}
          </span>
          <Button
            type="button"
            variant="clear"
            size="icon-xs"
            onClick={() => onRemove(link.id)}
            aria-label={`Remove the link to ${link.title}`}
            title="Remove link"
          >
            <X aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
