import type { GameEditSection } from "./engine";

// Text & video: the game's description and Featured Video, the two fields
// the API's game update writes. One update carries only the changed fields.

export interface GameText {
  description: string | null;
  featured_video_url: string | null;
}

// Only the fields the editor touched.
export type TextStage = Partial<GameText>;

export interface GameUpdateCall {
  kind: "game.update";
  fields: Partial<GameText>;
}

// Blank is cleared (null); a video link loses its stray spaces.
const tidy: { [F in keyof GameText]: (v: string | null) => string | null } = {
  description: (v) => (v && v.trim() ? v : null),
  featured_video_url: (v) => v?.trim() || null,
};

const FIELDS = ["description", "featured_video_url"] as const;

function changed(loaded: GameText, staged: TextStage): Partial<GameText> {
  const fields: Partial<GameText> = {};
  for (const f of FIELDS) {
    if (!(f in staged)) continue;
    const value = tidy[f](staged[f] ?? null);
    if (value !== tidy[f](loaded[f])) fields[f] = value;
  }
  return fields;
}

// Whether a field's staged value would change the record, by the same
// tidying Save all uses (trailing spaces in a link don't count).
export function textFieldEdited(loaded: GameText, staged: TextStage | undefined, field: keyof GameText): boolean {
  return !!staged && field in changed(loaded, staged);
}

export function isWebLink(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const textSection: GameEditSection<GameText, TextStage, GameUpdateCall> = {
  label: "Text & video",
  access: "admin",
  changes: (loaded, staged) => Object.keys(changed(loaded, staged)).length,
  check: (staged, loaded) => {
    const video = changed(loaded, staged).featured_video_url;
    return video && !isWebLink(video) ? "The Featured Video must be a web link (https://…)." : null;
  },
  plan: (loaded, staged) => {
    const fields = changed(loaded, staged);
    return Object.keys(fields).length > 0 ? [{ kind: "game.update", fields }] : [];
  },
  apply: (loaded, staged) => ({ ...loaded, ...changed(loaded, staged) }),
};
