// A Draft's sheet has its top corner turned down, the fold showing yellow
// underneath: the same mark the drafts pile carries, so a Draft reads as one
// thing wherever it lies. The cut-away half takes the board's ground.
export function DogEar() {
  return (
    <span aria-hidden className="pointer-events-none absolute top-0 right-0 z-30 size-6">
      <span className="absolute inset-0 bg-background [clip-path:polygon(0_0,100%_0,100%_100%)]" />
      {/* The shadow sits on a wrapper: a clip-path would cut its own. */}
      <span className="absolute inset-0 drop-shadow-[-2px_2px_3px_rgb(0_0_0/0.45)]">
        <span className="absolute inset-0 bg-highlight [clip-path:polygon(0_0,0_100%,100%_100%)]" />
      </span>
    </span>
  );
}
