import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import type { CodexEntry } from "@/lib/codex/types";
import { LORE_BACK, LORE_PATH } from "@/lib/codex/paths";
import { ButtonLink } from "@/components/ui/button";
import { BackLink } from "@/components/shell/back-link";
import { LoreDelete } from "./lore-delete";
import { LoreMasthead } from "./lore-masthead";
import { LoreSpread } from "./lore-spread";

// A Lore Entry as a magazine feature (www#125, design 3D): the masthead,
// the story with its photos taped into the margins, then See also, which
// www#127 fills (`seeAlso`, the solid jade band; left out when empty).
export function LoreEntryView({
  entry,
  story,
  badge,
  seeAlso,
}: {
  entry: CodexEntry;
  story: readonly unknown[];
  badge?: ReactNode;
  seeAlso?: ReactNode;
}) {
  const { can_edit, can_delete } = entry.viewer;
  return (
    <article>
      <div data-slot="lore-entry-top" className="mb-3 flex items-start justify-between gap-3">
        <BackLink {...LORE_BACK} className="mb-0" />
        {badge}
      </div>
      <LoreMasthead
        entry={entry}
        actions={
          (can_edit || can_delete) && (
            <div className="flex gap-2">
              {can_edit && (
                <ButtonLink href={`${LORE_PATH}/${entry.id}/edit`} variant="outline" size="sm">
                  <Pencil aria-hidden />
                  Edit
                </ButtonLink>
              )}
              {can_delete && <LoreDelete id={entry.id} size="sm" />}
            </div>
          )
        }
      />
      <div className="mt-10">
        <LoreSpread entry={entry} story={story} />
      </div>
      <div className="mt-14">{seeAlso}</div>
    </article>
  );
}
