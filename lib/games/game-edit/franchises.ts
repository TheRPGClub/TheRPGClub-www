import type { GameEditSection } from "./engine";
import type { GameFranchiseRef } from "@/lib/franchises/types";

// Franchises (spec api#442, design pick 7A): the Franchises the game is in,
// and whether it is Mainline in each. Regulars and above (the API's gate,
// the same as Game Threads') stage links to Franchises found by name, new
// Franchises made from the search, unlinks, and Mainline / Other per
// Franchise; Save all creates, links, then sets Mainline, then unlinks.

export type { GameFranchiseRef };

// The game's Franchises from its relations, by name.
export function gameFranchiseRefs(franchises: { franchise_id: number; name: string; mainline?: boolean }[]): GameFranchiseRef[] {
  return franchises
    .map(({ franchise_id, name, mainline }) => ({ franchise_id, name, mainline: !!mainline }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface FranchiseMainline {
  franchise_id: number;
  mainline: boolean;
}

export interface FranchisesStage {
  link: GameFranchiseRef[];
  // Franchises to make, by name, with the game's place in each.
  create: { name: string; mainline: boolean }[];
  unlink: number[];
  mainline: FranchiseMainline[];
}

export type FranchiseCall =
  | { kind: "franchise.create"; name: string; mainline: boolean }
  | { kind: "franchise.link"; franchiseId: number; mainline: boolean }
  | { kind: "franchise.mainline"; franchiseId: number; mainline: boolean }
  | { kind: "franchise.unlink"; franchiseId: number };

const EMPTY: FranchisesStage = { link: [], create: [], unlink: [], mainline: [] };

const linked = (loaded: GameFranchiseRef[], id: number) => loaded.find((f) => f.franchise_id === id);
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// The staged changes that would change the record.
function effective(loaded: GameFranchiseRef[], staged: FranchisesStage): FranchisesStage {
  const unlink = staged.unlink.filter((id) => linked(loaded, id));
  return {
    link: staged.link.filter((f) => !linked(loaded, f.franchise_id)),
    create: staged.create,
    unlink,
    mainline: staged.mainline.filter((m) => {
      const f = linked(loaded, m.franchise_id);
      return f && f.mainline !== m.mainline && !unlink.includes(m.franchise_id);
    }),
  };
}

const callKey = (c: FranchiseCall) =>
  c.kind === "franchise.create" ? `c${c.name.trim().toLowerCase()}` : `${c.kind}${c.franchiseId}`;

export const franchisesSection: GameEditSection<GameFranchiseRef[], FranchisesStage, FranchiseCall> = {
  label: "Franchises",
  access: "threads",
  changes: (loaded, staged) => {
    const e = effective(loaded, staged);
    return e.link.length + e.create.length + e.unlink.length + e.mainline.length;
  },
  plan: (loaded, staged) => {
    const e = effective(loaded, staged);
    return [
      ...e.create.map((c) => ({ kind: "franchise.create" as const, name: c.name, mainline: c.mainline })),
      ...e.link.map((f) => ({ kind: "franchise.link" as const, franchiseId: f.franchise_id, mainline: f.mainline })),
      ...e.mainline.map((m) => ({ kind: "franchise.mainline" as const, franchiseId: m.franchise_id, mainline: m.mainline })),
      ...e.unlink.map((franchiseId) => ({ kind: "franchise.unlink" as const, franchiseId })),
    ];
  },
  apply: (loaded, staged) => {
    const e = effective(loaded, staged);
    const kept = loaded
      .filter((f) => !e.unlink.includes(f.franchise_id))
      .map((f) => ({ ...f, mainline: e.mainline.find((m) => m.franchise_id === f.franchise_id)?.mainline ?? f.mainline }));
    // A new Franchise's id only the API knows: the page reads the record
    // back after the save, so a placeholder stands in until then.
    const made = e.create.map((c, i) => ({ franchise_id: -(i + 1), name: c.name.trim(), mainline: c.mainline }));
    return [...kept, ...e.link, ...made].sort((a, b) => a.name.localeCompare(b.name));
  },
  remaining: (loaded, staged, saved) => {
    const done = new Set(saved.map(callKey));
    const e = effective(loaded, staged);
    return {
      create: e.create.filter((c) => !done.has(`c${c.name.trim().toLowerCase()}`)),
      link: e.link.filter((f) => !done.has(`franchise.link${f.franchise_id}`)),
      mainline: e.mainline.filter((m) => !done.has(`franchise.mainline${m.franchise_id}`)),
      unlink: e.unlink.filter((id) => !done.has(`franchise.unlink${id}`)),
    };
  },
};

// The stage, or undefined once nothing is left in it.
function tidy(s: FranchisesStage): FranchisesStage | undefined {
  return s.link.length + s.create.length + s.unlink.length + s.mainline.length > 0 ? s : undefined;
}

// Stages a link to `franchise`, as Other. Linking a Franchise staged for
// unlink undoes the unlink; one already linked or staged does nothing.
export function stageFranchiseLink(
  loaded: GameFranchiseRef[],
  staged: FranchisesStage | undefined,
  franchise: { franchise_id: number; name: string },
): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  if (linked(loaded, franchise.franchise_id)) {
    return tidy({ ...s, unlink: s.unlink.filter((id) => id !== franchise.franchise_id) });
  }
  if (s.link.some((f) => f.franchise_id === franchise.franchise_id)) return staged;
  return { ...s, link: [...s.link, { franchise_id: franchise.franchise_id, name: franchise.name, mainline: false }] };
}

// Stages making a Franchise called `name` with the game in it, as Other.
export function stageFranchiseCreate(staged: FranchisesStage | undefined, name: string): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  const trimmed = name.trim();
  if (!trimmed || s.create.some((c) => sameName(c.name, trimmed))) return staged;
  return { ...s, create: [...s.create, { name: trimmed, mainline: false }] };
}

export function stageFranchiseUnlink(
  loaded: GameFranchiseRef[],
  staged: FranchisesStage | undefined,
  franchiseId: number,
): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  if (!linked(loaded, franchiseId) || s.unlink.includes(franchiseId)) return staged;
  return { ...s, unlink: [...s.unlink, franchiseId] };
}

// A row's key: `f<id>` for a Franchise, `new:<name>` for one to make.
export type FranchiseRowKey = string;

// Sets the game Mainline (true) or Other (false) in the row's Franchise.
export function stageFranchiseMainline(
  loaded: GameFranchiseRef[],
  staged: FranchisesStage | undefined,
  key: FranchiseRowKey,
  mainline: boolean,
): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  if (key.startsWith("new:")) {
    const name = key.slice(4);
    return { ...s, create: s.create.map((c) => (sameName(c.name, name) ? { ...c, mainline } : c)) };
  }
  const id = Number(key.slice(1));
  if (s.link.some((f) => f.franchise_id === id)) {
    return { ...s, link: s.link.map((f) => (f.franchise_id === id ? { ...f, mainline } : f)) };
  }
  const was = linked(loaded, id);
  if (!was) return staged;
  const rest = s.mainline.filter((m) => m.franchise_id !== id);
  return tidy({ ...s, mainline: was.mainline === mainline ? rest : [...rest, { franchise_id: id, mainline }] });
}

// Drops whatever is staged for the row (its Undo).
export function unstageFranchise(staged: FranchisesStage | undefined, key: FranchiseRowKey): FranchisesStage | undefined {
  if (!staged) return undefined;
  if (key.startsWith("new:")) {
    const name = key.slice(4);
    return tidy({ ...staged, create: staged.create.filter((c) => !sameName(c.name, name)) });
  }
  const id = Number(key.slice(1));
  return tidy({
    link: staged.link.filter((f) => f.franchise_id !== id),
    create: staged.create,
    unlink: staged.unlink.filter((x) => x !== id),
    mainline: staged.mainline.filter((m) => m.franchise_id !== id),
  });
}

export type FranchiseMark = "edited" | "added" | "removing" | null;

export interface FranchiseRow {
  key: FranchiseRowKey;
  franchise_id: number | null;
  name: string;
  mainline: boolean;
  mark: FranchiseMark;
}

// The tab's rows: the game's Franchises (with their staged Mainline and
// unlink), then the staged links and new Franchises.
export function franchisesView(loaded: GameFranchiseRef[], staged: FranchisesStage | undefined): FranchiseRow[] {
  const e = effective(loaded, staged ?? EMPTY);
  return [
    ...loaded.map((f) => {
      const change = e.mainline.find((m) => m.franchise_id === f.franchise_id);
      const removing = e.unlink.includes(f.franchise_id);
      return {
        key: `f${f.franchise_id}`,
        franchise_id: f.franchise_id,
        name: f.name,
        mainline: change?.mainline ?? f.mainline,
        mark: removing ? ("removing" as const) : change ? ("edited" as const) : null,
      };
    }),
    ...e.link.map((f) => ({ key: `f${f.franchise_id}`, franchise_id: f.franchise_id, name: f.name, mainline: f.mainline, mark: "added" as const })),
    ...e.create.map((c) => ({ key: `new:${c.name}`, franchise_id: null, name: c.name, mainline: c.mainline, mark: "added" as const })),
  ];
}

// Whether a search result is on the game already, or staged to be.
export function franchisePicked(loaded: GameFranchiseRef[], staged: FranchisesStage | undefined, franchiseId: number): boolean {
  if (linked(loaded, franchiseId)) return !staged?.unlink.includes(franchiseId);
  return !!staged?.link.some((f) => f.franchise_id === franchiseId);
}

// Whether a Franchise called `name` is already staged to be made.
export function franchiseStagedForCreate(staged: FranchisesStage | undefined, name: string): boolean {
  return !!staged?.create.some((c) => sameName(c.name, name));
}
