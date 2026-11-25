import type { UndoDelete } from "@/hooks/use-undo-delete";
import { SHELF_TITLES, type ShelfList } from "@/lib/games/shelf";
import { UndoBar } from "@/components/admin/desk/undo-bar";

// Under the game page's list control: each removal waiting behind its Undo
// bar ("<list>:<entry id>"), a removal the API refused, and what a save did
// ("It left your Now Playing").
export function ShelfNotices({ removal, notice }: { removal: UndoDelete<string>; notice: string | null }) {
  return (
    <>
      {[...removal.held].map((key) => (
        <UndoBar
          key={key}
          className="max-w-md"
          message={`Removed from ${SHELF_TITLES[key.split(":")[0] as ShelfList]}.`}
          delayMs={removal.delayMs}
          onUndo={() => removal.undo(key)}
        />
      ))}
      {[...removal.errors].map(([key, error]) => (
        <p key={key} role="alert" className="text-[0.84rem] text-destructive">
          {error}
        </p>
      ))}
      {notice && (
        <p role="status" className="font-label text-[0.82rem] font-bold tracking-[0.07em] text-dim-foreground uppercase">
          {notice}
        </p>
      )}
    </>
  );
}
