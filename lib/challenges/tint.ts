import type { CSSProperties } from "react";
import type { Challenge, ChallengeTint } from "@/lib/challenges/types";

// A Challenge's tint (DESIGN.md, "Challenges inks"). The API stores the pair
// on the Challenge; until a Challenge carries one, the site picks the same
// curated tint the API's fallback does (api Challenges::Tint.fallback), so the
// colour doesn't change when the stored one arrives: holly for an Assignment
// Challenge (Secret Santa's own), otherwise one of the other seven by id.
// Client-safe.

export const CURATED_TINTS = {
  teal: { fill: "#1f6b67", hi: "#6fd6cc" },
  cobalt: { fill: "#2c4f8e", hi: "#9ab8f2" },
  holly: { fill: "#1c6545", hi: "#3fbf8a" },
  umber: { fill: "#7a531c", hi: "#e0b56e" },
  moss: { fill: "#3b5a2b", hi: "#a9cf86" },
  azure: { fill: "#2a5ea6", hi: "#9cc2f5" },
  slate: { fill: "#3a3a52", hi: "#b4b4d6" },
  ochre: { fill: "#8a6417", hi: "#e6c36a" },
} as const satisfies Record<string, ChallengeTint>;

const ROTATION = ["teal", "cobalt", "umber", "moss", "azure", "slate", "ochre"] as const;

const HEX = /^#[0-9a-f]{6}$/i;

export function challengeTint(challenge: Pick<Challenge, "id" | "challenge_format" | "tint">): ChallengeTint {
  const stored = challenge.tint;
  if (stored && HEX.test(stored.fill) && HEX.test(stored.hi)) return stored;
  if (challenge.challenge_format === "assignment") return CURATED_TINTS.holly;
  const index = ((challenge.id % ROTATION.length) + ROTATION.length) % ROTATION.length;
  return CURATED_TINTS[ROTATION[index]];
}

// The paper type every tint fill carries (the Tint Carries Its Type Rule):
// fixed like the tint itself, so a Theme never sets unreadable type on it.
export const TINT_TYPE = "#f4f4f0";

// The tint as the custom properties a Challenge surface reads
// (`--challenge-tint`, `--challenge-tint-hi`, and `--challenge-type` for
// type on the fill), set on the card or page root.
export function tintStyle(tint: ChallengeTint): CSSProperties {
  return {
    "--challenge-tint": tint.fill,
    "--challenge-tint-hi": tint.hi,
    "--challenge-type": TINT_TYPE,
  } as CSSProperties;
}

// A flyer's stable tilt from its id, within ±1.4deg (DESIGN.md, the
// Hand-Placed Rule): the same Challenge always rests at the same angle.
export function flyerTilt(id: number): number {
  const steps = [-1.4, 0.8, -0.6, 1.2, -1.1, 0.5, 1.4, -0.9];
  return steps[Math.abs(id) % steps.length];
}
