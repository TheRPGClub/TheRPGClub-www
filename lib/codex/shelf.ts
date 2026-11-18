// The Club Lore shelf (design 4D): each Lore Entry stands as a spine whose
// width says how long its story is, at a stable, slightly uneven height and
// in one of three bindings chosen from its id.

export const SPINE_MIN_WIDTH = 74;
export const SPINE_MAX_WIDTH = 112;
const LONGEST = 4000;

// 74px for the shortest story up to 112px at 4000 characters, linear.
export function spineWidth(bodyLength: number): number {
  const share = Math.min(Math.max(bodyLength, 0), LONGEST) / LONGEST;
  return Math.round(SPINE_MIN_WIDTH + share * (SPINE_MAX_WIDTH - SPINE_MIN_WIDTH));
}

// A well-mixed hash of the id, so neighbouring ids look unrelated.
function hash(id: number): number {
  let x = Math.imul(id, 0x9e3779b1) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  return (x ^ (x >>> 13)) >>> 0;
}

// 440 to 520px, from the id.
export function spineHeight(id: number): number {
  return 440 + ((hash(id) >>> 4) % 81);
}

export type SpineBinding = "jade" | "ink" | "paper";
const BINDINGS: SpineBinding[] = ["jade", "ink", "paper"];

export function spineBinding(id: number): SpineBinding {
  return BINDINGS[hash(id) % BINDINGS.length];
}
