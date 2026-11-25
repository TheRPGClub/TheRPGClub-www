// What a screen reader hears while reordering (hooks/use-sortable.ts): the
// instructions every sortable item points at, and the running commentary.
export function SortStatus({ status }: { status: { id: string; text: string } }) {
  return (
    <>
      <p id={status.id} className="sr-only">
        Drag to reorder, or press Space to pick it up, the arrow keys to move it, Space to drop it and Escape to put it back.
      </p>
      <p aria-live="assertive" className="sr-only">
        {status.text}
      </p>
    </>
  );
}
