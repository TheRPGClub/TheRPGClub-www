import { parseHltbHours, type Hltb } from "@/lib/hltb";
import type { GameEditSection } from "./engine";
import { isWebLink } from "./text";

// Time to beat: the game's HowLongToBeat times entered by hand (and the
// matched page's link), for when the lookup matched the wrong game. One HLTB
// upsert carries only the changed fields. The lookup itself is an action on
// the tab, not a staged edit.

export const HLTB_FIELDS = ["main", "main_sides", "completionist", "url"] as const;
export type HltbField = (typeof HLTB_FIELDS)[number];
const TIMES = ["main", "main_sides", "completionist"] as const;

// The saved row, or null when the game has none.
export type HltbTimes = Hltb | null;

// What the editor typed: hours ("37", "52.5") and the link, per field.
export type HltbStage = Partial<Record<HltbField, string>>;

// The upsert's fields: the edited ones, and `name` cleared with a new link
// (the matched name belonged to the old page).
export type HltbUpsertFields = Partial<Pick<Hltb, HltbField | "name">>;

export interface HltbUpsertCall {
  kind: "hltb.upsert";
  fields: HltbUpsertFields;
}

// A saved time ("52½ Hours", "45 Mins") as the field shows it: "52.5".
export function hltbFieldValue(raw: string | null | undefined): string {
  const hours = parseHltbHours(raw);
  return hours === null ? "" : String(Math.round(hours * 100) / 100);
}

// Hours as HowLongToBeat writes them: "81 Hours", "52½ Hours".
export function hltbTimeText(hours: number): string {
  const whole = Math.floor(hours);
  if (hours === whole) return `${whole} Hours`;
  if (hours - whole === 0.5) return `${whole}½ Hours`;
  return `${Math.round(hours * 100) / 100} Hours`;
}

// A typed time as hours: null when blank, NaN when it isn't a number.
function typedHours(text: string): number | null {
  const value = text.trim().replace(",", ".").replace(/½$/, ".5");
  if (!value) return null;
  return /^\d+(\.\d+)?$/.test(value) && Number(value) > 0 ? Number(value) : NaN;
}

function changed(loaded: HltbTimes, staged: HltbStage): HltbUpsertFields {
  const fields: HltbUpsertFields = {};
  for (const f of TIMES) {
    const text = staged[f];
    if (text === undefined) continue;
    const hours = typedHours(text);
    if (Number.isNaN(hours)) {
      fields[f] = text;
      continue;
    }
    if (hours !== parseHltbHours(loaded?.[f])) fields[f] = hours === null ? null : hltbTimeText(hours);
  }
  if (staged.url !== undefined) {
    const url = staged.url.trim() || null;
    if (url !== (loaded?.url?.trim() || null)) {
      fields.url = url;
      if (loaded?.name) fields.name = null;
    }
  }
  return fields;
}

// The edits the editor made; a cleared name rides on its link.
const changeCount = (loaded: HltbTimes, staged: HltbStage) =>
  Object.keys(changed(loaded, staged)).filter((f) => f !== "name").length;

const BLANK: Hltb = {
  name: null,
  url: null,
  image_url: null,
  main: null,
  main_sides: null,
  completionist: null,
  single_player: null,
  co_op: null,
  vs: null,
  source_query: null,
  scraped_at: null,
  updated_at: null,
};

export const hltbSection: GameEditSection<HltbTimes, HltbStage, HltbUpsertCall> = {
  label: "Time to beat",
  access: "admin",
  changes: changeCount,
  check: (staged, loaded) => {
    const fields = changed(loaded, staged);
    if (TIMES.some((f) => f in staged && Number.isNaN(typedHours(staged[f] ?? "")))) {
      return "Times are hours, like 37 or 52.5.";
    }
    return fields.url && !isWebLink(fields.url) ? "The HowLongToBeat link must be a web link (https://…)." : null;
  },
  plan: (loaded, staged) => {
    const fields = changed(loaded, staged);
    return Object.keys(fields).length > 0 ? [{ kind: "hltb.upsert", fields }] : [];
  },
  apply: (loaded, staged) => ({ ...(loaded ?? BLANK), ...changed(loaded, staged) }),
};
