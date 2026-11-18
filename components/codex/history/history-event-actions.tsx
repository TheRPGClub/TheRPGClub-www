import { editHistoryPath } from "@/lib/codex/paths";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { HistoryDelete } from "./history-delete";

// A History Event's quiet Edit and Delete (2B), from its `viewer` flags, at
// the right of its date line: shown on hover or focus where there is a
// pointer that hovers, always on touch screens. Delete asks first.
export function HistoryEventActions({
  id,
  title,
  canEdit,
  canDelete,
}: {
  id: number;
  title: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  if (!canEdit && !canDelete) return null;
  return (
    <div
      className={cn(
        "ml-auto flex shrink-0 items-center gap-1 transition-opacity",
        "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/event:opacity-100 [@media(hover:hover)]:group-focus-within/event:opacity-100",
      )}
    >
      {canEdit && (
        <ButtonLink href={editHistoryPath(id)} variant="quiet-link" size="xs" aria-label={`Edit ${title}`}>
          Edit
        </ButtonLink>
      )}
      {canDelete && <HistoryDelete id={id} quiet={{ title }} />}
    </div>
  );
}
