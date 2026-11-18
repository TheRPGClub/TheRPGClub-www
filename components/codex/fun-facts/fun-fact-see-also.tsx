"use client";

import { Link2 } from "lucide-react";
import type { DeskLinks } from "@/hooks/use-desk-links";
import { Button } from "@/components/ui/button";
import { SeeAlsoPicker } from "@/components/codex/see-also/see-also-picker";

// A Fun Fact's See also on the wall (www#127, 5D): the ghost "See also"
// that opens the picker under the field, with the count of linked entries
// while it is closed.
export function SeeAlsoToggle({
  links,
  open,
  onToggle,
  controls,
}: {
  links: Pick<DeskLinks, "links">;
  open: boolean;
  onToggle: () => void;
  controls: string;
}) {
  const n = links.links.length;
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onToggle} aria-expanded={open} aria-controls={controls}>
      <Link2 aria-hidden />
      See also{n > 0 && ` · ${n}`}
    </Button>
  );
}

export function FunFactSeeAlsoPanel({
  id,
  links,
  self,
}: {
  id: string;
  links: DeskLinks;
  self: number | null;
}) {
  return (
    <div id={id} className="mt-3 border-t border-border pt-3">
      <SeeAlsoPicker links={links} self={self} autoFocus />
      <p className="mt-2.5 text-[0.8125rem] text-faint-foreground">
        A link shows on both entries. Removing it here removes it from both.
      </p>
    </div>
  );
}
