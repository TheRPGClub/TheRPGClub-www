// The Lore shelf before anything is on it: the plank with dashed outlines
// where spines will stand (the site's empty slot, as a locked Achievement's
// is), at the shelf's own uneven heights, the last one leaning on the rest.
// Phones drop the `wide` slots so the leaning one still fits.
const SLOTS = [
  { w: 58, h: 206 },
  { w: 72, h: 232, wide: true },
  { w: 52, h: 190 },
  { w: 66, h: 220 },
  { w: 48, h: 238, wide: true },
  { w: 62, h: 198, lean: true },
] as const;

export function LoreEmptyShelf() {
  return (
    <div aria-hidden className="min-w-0 rounded-md bg-card px-7 pt-10">
      <div className="flex h-60 items-end gap-1.5 overflow-hidden">
        {SLOTS.map((slot, i) => (
          <span
            key={i}
            style={{ width: slot.w, height: slot.h }}
            className={
              "shrink-0 rounded-t-[2.4px] border-2 border-b-0 border-dashed border-border-strong" +
              ("lean" in slot ? " ml-1 origin-bottom-left rotate-[9deg]" : "") +
              ("wide" in slot ? " max-sm:hidden" : "")
            }
          />
        ))}
      </div>
      <div className="-mx-7 h-4 bg-border-strong shadow-[0_8px_16px_rgb(0_0_0/0.5)]" />
      <div className="h-10" />
    </div>
  );
}
