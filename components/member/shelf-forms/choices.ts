import { BookOpen, Map as MapIcon, Trophy } from "lucide-react";
import { COMPLETION_TYPES, OWNERSHIP_TYPES } from "@/lib/member-shelf/entry-meta";
import type { SlipChoice } from "./slip-choices";

// The slip's ink boxes for the API's fixed values, each with what it means
// (spec api#451, 2B's tiles in 2D's ink). The ownership boxes sit four to
// a row, so they go without icons.
const COMPLETION_HINTS: Record<(typeof COMPLETION_TYPES)[number], Omit<SlipChoice, "value">> = {
  "Main Story": { label: "Main Story", hint: "The credits rolled.", icon: BookOpen },
  "Main Story + Side Content": { label: "+ Side Content", hint: "And a good share of the rest.", icon: MapIcon },
  Completionist: { label: "Completionist", hint: "Everything there is.", icon: Trophy },
};

const OWNERSHIP_HINTS: Record<(typeof OWNERSHIP_TYPES)[number], Omit<SlipChoice, "value">> = {
  Digital: { label: "Digital", hint: "A store download." },
  Physical: { label: "Physical", hint: "Cart, disc or box." },
  Subscription: { label: "Subscription", hint: "Game Pass and kin." },
  Other: { label: "Other", hint: "Anything else." },
};

export const COMPLETION_CHOICES: SlipChoice[] = COMPLETION_TYPES.map((value) => ({ value, ...COMPLETION_HINTS[value] }));
export const OWNERSHIP_CHOICES: SlipChoice[] = OWNERSHIP_TYPES.map((value) => ({ value, ...OWNERSHIP_HINTS[value] }));
