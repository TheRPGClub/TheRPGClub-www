import type { GameEditSection } from "./engine";
import type { GameFranchiseRef } from "@/lib/franchises/types";

// Franchises (spec api#442, role lanes api#487 / www#207): the Franchises the
// game is in and its role in each, shown in three lanes: Mainline in,
// Spin-off of and Add-on of. Mainline is per Franchise; an Add-on's parent is
// the game's (`parent_igdb_id`), so a game with a parent is an Add-on in
// every Franchise it is in, whatever its Mainline mark. Regulars and above
// (the API's gate, the same as Game Threads') stage links, new Franchises,
// unlinks, Mainline and the parent; Save all creates (each new Franchise is
// made bare, then linked by its own call), links, sets Mainline, sets the
// parent, then unlinks.

export type { GameFranchiseRef };

export type FranchiseRole = "mainline" | "spinoff" | "addon";
export const FRANCHISE_ROLES: FranchiseRole[] = ["mainline", "spinoff", "addon"];

// The game an Add-on belongs to. A loaded parent carries only its name (the
// game read has no parent game id); a picked one carries its GameDB id.
export interface GameParent {
  game_id: number | null;
  name: string;
}

export interface GameFranchises {
  franchises: GameFranchiseRef[];
  parent: GameParent | null;
}

// The game's Franchises from its relations, by name, and its parent.
export function gameFranchiseRefs(
  franchises: { franchise_id: number; name: string; mainline?: boolean }[],
  parentName: string | null = null,
): GameFranchises {
  return {
    franchises: franchises
      .map(({ franchise_id, name, mainline }) => ({ franchise_id, name, mainline: !!mainline }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    parent: parentName ? { game_id: null, name: parentName } : null,
  };
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
  // The game's new parent (a picked GameDB game), or null to clear it.
  // Absent keeps the loaded one.
  parent?: { game_id: number; name: string } | null;
}

// `created` names a Franchise this save makes: its id is 0 in the plan and
// filled in (`bind`) from the create's `madeId` once that saved.
export type FranchiseCall =
  | { kind: "franchise.create"; name: string; madeId?: number }
  | { kind: "franchise.link"; franchiseId: number; created?: string; mainline: boolean; parentGameId?: number | null }
  | { kind: "franchise.mainline"; franchiseId: number; mainline: boolean }
  | { kind: "franchise.parent"; franchiseId: number; created?: string; parentGameId: number | null }
  | { kind: "franchise.unlink"; franchiseId: number };

const EMPTY: FranchisesStage = { link: [], create: [], unlink: [], mainline: [] };

const linked = (loaded: GameFranchises, id: number) => loaded.franchises.find((f) => f.franchise_id === id);
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Whether the staged parent changes the loaded one. A loaded parent read
// with the game has no id, only a name, so a pick is matched on that.
function parentChanged(loaded: GameFranchises, staged: FranchisesStage): boolean {
  const p = staged.parent;
  if (p === undefined) return false;
  if (p === null) return loaded.parent !== null;
  if (!loaded.parent) return true;
  if (loaded.parent.game_id !== null) return loaded.parent.game_id !== p.game_id;
  return !sameName(loaded.parent.name, p.name);
}

// The game's parent with the stage applied.
export function effectiveParent(loaded: GameFranchises, staged: FranchisesStage | undefined): GameParent | null {
  return staged && staged.parent !== undefined ? staged.parent : loaded.parent;
}

// The staged changes that would change the record.
function effective(loaded: GameFranchises, staged: FranchisesStage) {
  const unlink = staged.unlink.filter((id) => linked(loaded, id));
  return {
    link: staged.link.filter((f) => !linked(loaded, f.franchise_id)),
    create: staged.create,
    unlink,
    mainline: staged.mainline.filter((m) => {
      const f = linked(loaded, m.franchise_id);
      return f && f.mainline !== m.mainline && !unlink.includes(m.franchise_id);
    }),
    parent: parentChanged(loaded, staged) ? staged.parent : undefined,
  };
}

const callKey = (c: FranchiseCall) =>
  c.kind === "franchise.create" ? `c${c.name.trim().toLowerCase()}` : `${c.kind}${c.franchiseId}`;

// The ids of the Franchises `saved` made, by lowercased name.
function madeIds(saved: FranchiseCall[]): Map<string, number> {
  const made = new Map<string, number>();
  for (const c of saved) {
    if (c.kind === "franchise.create" && c.madeId !== undefined) made.set(c.name.trim().toLowerCase(), c.madeId);
  }
  return made;
}

// The calls that save the stage. A new Franchise is made bare and then
// linked by its own call, so a link refused after a create leaves a
// Franchise the retry links (see `remaining`) rather than makes again. The
// parent goes through the Franchise link endpoint, so it rides on a
// Franchise the game is in: a loaded one (before any unlink), else the first
// new link, else its own call on the first new Franchise once it is linked.
function planCalls(loaded: GameFranchises, staged: FranchisesStage): FranchiseCall[] {
  const e = effective(loaded, staged);
  const parentId = e.parent === undefined ? undefined : (e.parent?.game_id ?? null);
  const carrier = parentId === undefined ? null : loaded.franchises[0] ? "loaded" : e.link[0] ? "link" : "create";
  return [
    ...e.create.flatMap((c) => [
      { kind: "franchise.create" as const, name: c.name },
      { kind: "franchise.link" as const, franchiseId: 0, created: c.name, mainline: c.mainline },
    ]),
    ...e.link.map((f, i) => ({
      kind: "franchise.link" as const,
      franchiseId: f.franchise_id,
      mainline: f.mainline,
      ...(carrier === "link" && i === 0 ? { parentGameId: parentId } : {}),
    })),
    ...e.mainline.map((m) => ({ kind: "franchise.mainline" as const, franchiseId: m.franchise_id, mainline: m.mainline })),
    ...(carrier === "loaded"
      ? [{ kind: "franchise.parent" as const, franchiseId: loaded.franchises[0].franchise_id, parentGameId: parentId ?? null }]
      : []),
    ...(carrier === "create"
      ? [{ kind: "franchise.parent" as const, franchiseId: 0, created: e.create[0].name, parentGameId: parentId ?? null }]
      : []),
    ...e.unlink.map((franchiseId) => ({ kind: "franchise.unlink" as const, franchiseId })),
  ];
}

const countOf = (e: ReturnType<typeof effective>) =>
  e.link.length + e.create.length + e.unlink.length + e.mainline.length + (e.parent === undefined ? 0 : 1);

export const franchisesSection: GameEditSection<GameFranchises, FranchisesStage, FranchiseCall> = {
  label: "Franchises",
  access: "threads",
  changes: (loaded, staged) => countOf(effective(loaded, staged)),
  check: (staged, loaded) => {
    const e = effective(loaded, staged);
    if (e.parent === undefined || loaded.franchises.length + e.link.length + e.create.length > 0) return null;
    return "Link the game to a Franchise to make it an Add-on.";
  },
  plan: planCalls,
  apply: (loaded, staged) => {
    const e = effective(loaded, staged);
    const kept = loaded.franchises
      .filter((f) => !e.unlink.includes(f.franchise_id))
      .map((f) => ({ ...f, mainline: e.mainline.find((m) => m.franchise_id === f.franchise_id)?.mainline ?? f.mainline }));
    // A new Franchise's id only the API knows: the page reads the record
    // back after the save, so a placeholder stands in until then.
    const made = e.create.map((c, i) => ({ franchise_id: -(i + 1), name: c.name.trim(), mainline: c.mainline }));
    return {
      franchises: [...kept, ...e.link, ...made].sort((a, b) => a.name.localeCompare(b.name)),
      parent: e.parent === undefined ? loaded.parent : e.parent,
    };
  },
  bind: (call, saved) => {
    if (!("created" in call) || call.created === undefined) return call;
    const id = madeIds(saved).get(call.created.trim().toLowerCase());
    return id === undefined ? call : { ...call, franchiseId: id };
  },
  // A new Franchise that was made but not linked stays as a link to it, so
  // the retry doesn't make it again.
  remaining: (loaded, staged, saved) => {
    const done = new Set(saved.map(callKey));
    const made = madeIds(saved);
    const e = effective(loaded, staged);
    const madeLinks = e.create.flatMap((c) => {
      const id = made.get(c.name.trim().toLowerCase());
      return id === undefined || done.has(`franchise.link${id}`) ? [] : [{ franchise_id: id, name: c.name, mainline: c.mainline }];
    });
    const next: FranchisesStage = {
      create: e.create.filter((c) => !made.has(c.name.trim().toLowerCase())),
      link: [...e.link.filter((f) => !done.has(`franchise.link${f.franchise_id}`)), ...madeLinks],
      mainline: e.mainline.filter((m) => !done.has(`franchise.mainline${m.franchise_id}`)),
      unlink: e.unlink.filter((id) => !done.has(`franchise.unlink${id}`)),
    };
    const parentSaved = saved.some((c) => "parentGameId" in c && c.parentGameId !== undefined);
    if (e.parent !== undefined && !parentSaved) next.parent = e.parent;
    return next;
  },
};

// The stage, or undefined once nothing is left in it.
function tidy(s: FranchisesStage): FranchisesStage | undefined {
  const n = s.link.length + s.create.length + s.unlink.length + s.mainline.length;
  if (n > 0 || s.parent !== undefined) return s;
  return undefined;
}

// Sets the game's parent: a picked game, null to clear it. Setting it back
// to the loaded one drops the change.
export function stageFranchiseParent(
  loaded: GameFranchises,
  staged: FranchisesStage | undefined,
  parent: { game_id: number; name: string } | null,
): FranchisesStage | undefined {
  const s: FranchisesStage = { ...(staged ?? EMPTY), parent };
  if (!parentChanged(loaded, s)) delete s.parent;
  return tidy(s);
}

// Drops a staged parent change (its Undo).
export function unstageFranchiseParent(staged: FranchisesStage | undefined): FranchisesStage | undefined {
  if (!staged || staged.parent === undefined) return staged;
  const s = { ...staged };
  delete s.parent;
  return tidy(s);
}

// Stages a link to `franchise` as Mainline or a Spin-off. Linking a Franchise
// staged for unlink undoes the unlink (and sets its Mainline); one already
// staged takes the new Mainline.
export function stageFranchiseLink(
  loaded: GameFranchises,
  staged: FranchisesStage | undefined,
  franchise: { franchise_id: number; name: string },
  mainline = false,
): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  if (linked(loaded, franchise.franchise_id)) {
    const kept = tidy({ ...s, unlink: s.unlink.filter((id) => id !== franchise.franchise_id) });
    return stageFranchiseMainline(loaded, kept, `f${franchise.franchise_id}`, mainline);
  }
  if (s.link.some((f) => f.franchise_id === franchise.franchise_id)) {
    return { ...s, link: s.link.map((f) => (f.franchise_id === franchise.franchise_id ? { ...f, mainline } : f)) };
  }
  return { ...s, link: [...s.link, { franchise_id: franchise.franchise_id, name: franchise.name, mainline }] };
}

// Stages making a Franchise called `name` with the game in it.
export function stageFranchiseCreate(
  staged: FranchisesStage | undefined,
  name: string,
  mainline = false,
): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  const trimmed = name.trim();
  if (!trimmed || s.create.some((c) => sameName(c.name, trimmed))) return staged;
  return { ...s, create: [...s.create, { name: trimmed, mainline }] };
}

export function stageFranchiseUnlink(
  loaded: GameFranchises,
  staged: FranchisesStage | undefined,
  franchiseId: number,
): FranchisesStage | undefined {
  const s = staged ?? EMPTY;
  if (!linked(loaded, franchiseId) || s.unlink.includes(franchiseId)) return staged;
  return { ...s, unlink: [...s.unlink, franchiseId] };
}

// A row's key: `f<id>` for a Franchise, `new:<name>` for one to make.
export type FranchiseRowKey = string;

// Sets the game Mainline (true) or a Spin-off (false) in the row's Franchise.
export function stageFranchiseMainline(
  loaded: GameFranchises,
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

// Moves a row to another lane. Into Mainline in or Spin-off of sets its
// Mainline and, for an Add-on, clears the game's parent (so every Franchise
// leaves Add-on of). Into Add-on of sets the game's parent, which the caller
// asks for when the game has none.
export function moveFranchise(
  loaded: GameFranchises,
  staged: FranchisesStage | undefined,
  key: FranchiseRowKey,
  to: FranchiseRole,
  parent?: { game_id: number; name: string },
): FranchisesStage | undefined {
  if (to === "addon") {
    if (effectiveParent(loaded, staged)) return staged;
    return parent ? stageFranchiseParent(loaded, staged, parent) : staged;
  }
  const next = stageFranchiseMainline(loaded, staged, key, to === "mainline");
  return effectiveParent(loaded, next) ? stageFranchiseParent(loaded, next, null) : next;
}

// Stages a Franchise from a lane's + Add slot: a found one (`franchise_id`)
// or a new one by name, in the lane's role. Mainline in and Spin-off of
// clear an Add-on's parent; Add-on of sets `parent` when the game has none.
// Add-on of keeps the Franchise's Mainline mark (loaded, or staged with its
// link): an Add-on counts as one whatever the mark.
export function stageFranchiseInLane(
  loaded: GameFranchises,
  staged: FranchisesStage | undefined,
  franchise: { franchise_id: number; name: string } | { name: string },
  role: FranchiseRole,
  parent?: { game_id: number; name: string },
): FranchisesStage | undefined {
  const mainline = role === "addon" ? keptMainline(loaded, staged, franchise) : role === "mainline";
  let next =
    "franchise_id" in franchise
      ? stageFranchiseLink(loaded, staged, franchise, mainline)
      : stageFranchiseCreate(staged, franchise.name, mainline);
  if (role === "addon") {
    if (!effectiveParent(loaded, next) && parent) next = stageFranchiseParent(loaded, next, parent);
  } else if (effectiveParent(loaded, next)) {
    next = stageFranchiseParent(loaded, next, null);
  }
  return next;
}

function keptMainline(
  loaded: GameFranchises,
  staged: FranchisesStage | undefined,
  franchise: { franchise_id: number } | { name: string },
): boolean {
  if (!("franchise_id" in franchise)) return false;
  const id = franchise.franchise_id;
  return linked(loaded, id)?.mainline ?? staged?.link.find((f) => f.franchise_id === id)?.mainline ?? false;
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
    ...staged,
    link: staged.link.filter((f) => f.franchise_id !== id),
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
  role: FranchiseRole;
  mark: FranchiseMark;
}

// The tab's rows: the game's Franchises (with their staged Mainline and
// unlink), then the staged links and new Franchises, each in its lane.
export function franchisesView(loaded: GameFranchises, staged: FranchisesStage | undefined): FranchiseRow[] {
  const e = effective(loaded, staged ?? EMPTY);
  const addOn = !!effectiveParent(loaded, staged);
  const role = (mainline: boolean): FranchiseRole => (addOn ? "addon" : mainline ? "mainline" : "spinoff");
  return [
    ...loaded.franchises.map((f) => {
      const change = e.mainline.find((m) => m.franchise_id === f.franchise_id);
      const removing = e.unlink.includes(f.franchise_id);
      const mainline = change?.mainline ?? f.mainline;
      return {
        key: `f${f.franchise_id}`,
        franchise_id: f.franchise_id,
        name: f.name,
        mainline,
        role: role(mainline),
        mark: removing ? ("removing" as const) : change ? ("edited" as const) : null,
      };
    }),
    ...e.link.map((f) => ({
      key: `f${f.franchise_id}`,
      franchise_id: f.franchise_id,
      name: f.name,
      mainline: f.mainline,
      role: role(f.mainline),
      mark: "added" as const,
    })),
    ...e.create.map((c) => ({
      key: `new:${c.name}`,
      franchise_id: null,
      name: c.name,
      mainline: c.mainline,
      role: role(c.mainline),
      mark: "added" as const,
    })),
  ];
}

export interface FranchiseLanes {
  mainline: FranchiseRow[];
  spinoff: FranchiseRow[];
  addon: FranchiseRow[];
  // The game's parent as staged, with its mark: Added (a new parent where
  // there was none), Edited (another parent), Removing (cleared).
  parent: { name: string; mark: FranchiseMark } | null;
}

export function franchiseLanes(loaded: GameFranchises, staged: FranchisesStage | undefined): FranchiseLanes {
  const rows = franchisesView(loaded, staged);
  const changed = staged ? parentChanged(loaded, staged) : false;
  const now = effectiveParent(loaded, staged);
  const parent = !changed
    ? loaded.parent && { name: loaded.parent.name, mark: null }
    : now
      ? { name: now.name, mark: loaded.parent ? ("edited" as const) : ("added" as const) }
      : loaded.parent && { name: loaded.parent.name, mark: "removing" as const };
  return {
    mainline: rows.filter((r) => r.role === "mainline"),
    spinoff: rows.filter((r) => r.role === "spinoff"),
    addon: rows.filter((r) => r.role === "addon"),
    parent,
  };
}

// Whether a search result is on the game already, or staged to be.
export function franchisePicked(loaded: GameFranchises, staged: FranchisesStage | undefined, franchiseId: number): boolean {
  if (linked(loaded, franchiseId)) return !staged?.unlink.includes(franchiseId);
  return !!staged?.link.some((f) => f.franchise_id === franchiseId);
}

// Whether a Franchise called `name` is already staged to be made.
export function franchiseStagedForCreate(staged: FranchisesStage | undefined, name: string): boolean {
  return !!staged?.create.some((c) => sameName(c.name, name));
}
