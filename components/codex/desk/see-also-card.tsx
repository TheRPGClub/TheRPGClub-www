"use client";

import type { DeskLinks } from "@/hooks/use-desk-links";
import { linkedNote } from "@/lib/codex/see-also";
import { SeeAlsoPicker } from "@/components/codex/see-also/see-also-picker";
import { DrawerCard } from "./drawer-card";

// The drawer's See also card (www#127, 5D): "See also" with "2 linked",
// the linked entries and the search. The links save after the entry.
export function SeeAlsoCard({ links, self, tilt }: { links: DeskLinks; self: number | null; tilt: number }) {
  return (
    <DrawerCard title="See also" note={linkedNote(links.links.length)} tilt={tilt}>
      <SeeAlsoPicker links={links} self={self} />
      <p className="mt-2.5 text-[0.8125rem] text-faint-foreground">
        A link shows on both entries. Removing it here removes it from both.
      </p>
    </DrawerCard>
  );
}
