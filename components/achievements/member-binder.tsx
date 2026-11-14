// The pieces of a member's binder (the member achievements page and the
// profile's Achievements section): the totals, the Linked Account chips,
// the index rows of sets with their game-tint tabs, and the rings.

export { BinderTotals, LinkedAccountChips } from "./binder-totals";
export { BinderIndexRow, SlotDots } from "./binder-index-row";

// The binder's rings down the gutter between the two pages.
export function BinderRings({ count }: { count: number }) {
  return (
    <div aria-hidden className="hidden flex-col items-center justify-around py-16 xl:flex">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          className="h-4 w-[30px] rounded-[9px] border-[3px] border-[#9a9aa2] bg-card shadow-[inset_0_2px_0_rgb(0_0_0/0.5),0_2px_4px_rgb(0_0_0/0.6)]"
        />
      ))}
    </div>
  );
}
