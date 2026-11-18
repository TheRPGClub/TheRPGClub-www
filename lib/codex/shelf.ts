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

// A page's bindings, left to right: each from its id, moved on to the next
// binding when it would repeat its left neighbour, so a shelf keeps the
// comp's alternating rhythm and each spine its binding for that page.
export function spineBindings(ids: readonly number[]): SpineBinding[] {
  const out: SpineBinding[] = [];
  for (const id of ids) {
    let binding = spineBinding(id);
    if (binding === out.at(-1)) binding = BINDINGS[(BINDINGS.indexOf(binding) + 1) % BINDINGS.length];
    out.push(binding);
  }
  return out;
}

// The scale that fits a row of spines into `available` px, never below 0.7
// (the phone scale) nor above 1.
export function shelfScale(widths: readonly number[], gap: number, available: number): number {
  const natural = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(widths.length - 1, 0);
  if (natural <= 0) return 1;
  return Math.min(1, Math.max(0.7, available / natural));
}
