// Which completion the Completed reel's spotlight shows (spec api#451, 3A).
// A completion the owner removed (held behind Undo, or sent) leaves a hole
// in the strip and can't be the spotlight, so the spotlight moves on to the
// next one still there, wrapping round; -1 when none is left.

export function reelIndex(selected: number, count: number, removed: (index: number) => boolean): number {
  if (count === 0) return -1;
  const start = Math.min(Math.max(selected, 0), count - 1);
  for (let k = 0; k < count; k++) {
    const i = (start + k) % count;
    if (!removed(i)) return i;
  }
  return -1;
}

// The reel's previous / next arrows from `from`, stepping over removed ones.
export function reelStep(from: number, delta: 1 | -1, count: number, removed: (index: number) => boolean): number {
  if (count === 0) return -1;
  for (let k = 1; k <= count; k++) {
    const i = (((from + delta * k) % count) + count) % count;
    if (!removed(i)) return i;
  }
  return from;
}
