// The pieces of a member's binder (the member achievements page and the
// profile's Achievements section): the totals, the Linked Account chips,
// the index rows of sets with their game-tint tabs, and the rings.

export { BinderTotals, LinkedAccountChips } from "./binder-totals";
export { BinderIndexRow } from "./binder-index-row";
export { SlotDots } from "./slot-dots";

// The binder's rings down the gutter between the two pages.
export function BinderRings({ count }: { count: number }) {
  return (
    <div aria-hidden data-slot="binder-rings" className="hidden flex-col items-center justify-around py-16 xl:flex">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} data-slot="binder-ring" className="h-4 w-[30px]" />
      ))}
    </div>
  );
}
