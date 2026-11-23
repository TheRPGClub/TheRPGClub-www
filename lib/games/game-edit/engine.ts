// The Game Edit save module's engine (spec api#437): the pure logic behind
// Save all on /games/:id/edit. Given the game's record as loaded and the
// staged edits per section, it diffs each section, plans only the changed
// sections' calls, runs them through injected steps (server actions in the
// app, fakes in tests) and reports per section. It keeps going past a failed
// section; a failed section's edits stay staged, a saved section's clear.
//
// A section plugs in as a GameEditSection (see ./index.ts for the registry):
// it says which gate it needs, how many changes its stage holds, the calls
// that save them, and what its record looks like once they have. The engine
// knows nothing of any one section.

export type StepResult = { ok: true } | { ok: false; error: string };

// The viewer's gates: Admin-or-above, and the API's Regulars-or-staff gate
// for Game Threads.
export interface GameEditViewer {
  admin: boolean;
  threads: boolean;
}

export type SectionAccess = "admin" | "threads";

export interface GameEditSection<Loaded, Staged, Call extends { kind: string }> {
  // The section's name in reports ("Text & video").
  label: string;
  // The gate a viewer must pass for the section to be planned at all.
  access: SectionAccess;
  // How many changes the stage holds against the record; 0 means untouched.
  changes(loaded: Loaded, staged: Staged): number;
  // Why the stage can't be saved as it is, or null. A section that fails its
  // check fails without a call.
  check?(staged: Staged, loaded: Loaded): string | null;
  // The calls that save the stage, in order. Empty when untouched.
  plan(loaded: Loaded, staged: Staged): Call[];
  // The section's record once every planned call went through.
  apply(loaded: Loaded, staged: Staged): Loaded;
  // What stays staged when only `saved` of the planned calls went through
  // before one failed. Without it the whole stage stays.
  remaining?(loaded: Loaded, staged: Staged, saved: Call[]): Staged;
}

export interface SectionSpec {
  loaded: unknown;
  staged: unknown;
  call: { kind: string };
}

type Keys<M> = keyof M & string;
export type SectionMap<M> = { [K in keyof M]: SectionSpec };
export type EditRecord<M extends SectionMap<M>> = { [K in Keys<M>]: M[K]["loaded"] };
export type EditStage<M extends SectionMap<M>> = { [K in Keys<M>]?: M[K]["staged"] };
export type EditCall<M extends SectionMap<M>> = M[Keys<M>]["call"];
export type EditSteps<M extends SectionMap<M>> = {
  [C in EditCall<M> as C["kind"]]: (call: C) => Promise<StepResult>;
};
export type EditSections<M extends SectionMap<M>> = {
  [K in Keys<M>]: GameEditSection<M[K]["loaded"], M[K]["staged"], M[K]["call"]>;
};

export interface PlanEntry<K extends string, C> {
  key: K;
  calls: C[];
  // The section's check refused the stage: it fails without a call.
  error: string | null;
}

export interface SectionReport<K extends string> {
  key: K;
  label: string;
  status: "saved" | "failed";
  error?: string;
}

export interface EditOutcome<M extends SectionMap<M>> {
  // Every section that had changes, in section order.
  sections: SectionReport<Keys<M>>[];
  // The edits still staged: the failed sections' only.
  staged: EditStage<M>;
  // The record with the saved sections' changes in it.
  record: EditRecord<M>;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

// "4 saved, 1 failed: Releases", "1 failed: Releases", or "2 saved".
export function saveSummary(outcome: { sections: { label: string; status: string }[] }): string {
  const failed = outcome.sections.filter((s) => s.status === "failed");
  const saved = outcome.sections.length - failed.length;
  if (failed.length === 0) return `${saved} saved`;
  const names = failed.map((s) => s.label).join(", ");
  return saved === 0 ? `${failed.length} failed: ${names}` : `${saved} saved, ${failed.length} failed: ${names}`;
}

export function createGameEditSave<M extends SectionMap<M>>(sections: EditSections<M>, order: Keys<M>[]) {
  type K = Keys<M>;
  type AnySection = GameEditSection<unknown, unknown, { kind: string }>;
  const section = (key: K) => sections[key] as AnySection;
  const allowed = (key: K, viewer: GameEditViewer) => viewer[section(key).access];

  // The sections the viewer may save that hold changes, in order.
  function touched(record: EditRecord<M>, stage: EditStage<M>, viewer: GameEditViewer) {
    return order.filter(
      (key) => stage[key] !== undefined && allowed(key, viewer) && section(key).changes(record[key], stage[key]) > 0,
    );
  }

  function changes(record: EditRecord<M>, stage: EditStage<M>, viewer: GameEditViewer) {
    const bySection: Partial<Record<K, number>> = {};
    let total = 0;
    for (const key of touched(record, stage, viewer)) {
      const n = section(key).changes(record[key], stage[key]);
      bySection[key] = n;
      total += n;
    }
    return { total, bySection };
  }

  function plan(record: EditRecord<M>, stage: EditStage<M>, viewer: GameEditViewer): PlanEntry<K, EditCall<M>>[] {
    return touched(record, stage, viewer).map((key) => {
      const s = section(key);
      const error = s.check?.(stage[key], record[key]) ?? null;
      return { key, calls: error ? [] : (s.plan(record[key], stage[key]) as EditCall<M>[]), error };
    });
  }

  async function run(
    record: EditRecord<M>,
    stage: EditStage<M>,
    viewer: GameEditViewer,
    steps: EditSteps<M>,
  ): Promise<EditOutcome<M>> {
    const reports: SectionReport<K>[] = [];
    const staged: EditStage<M> = {};
    const next = { ...record };
    const call = steps as unknown as Record<string, (c: { kind: string }) => Promise<StepResult>>;
    for (const entry of plan(record, stage, viewer)) {
      const s = section(entry.key);
      const label = s.label;
      let error = entry.error;
      const saved: { kind: string }[] = [];
      for (const c of entry.calls) {
        if (error) break;
        const result = await call[c.kind](c).catch((): StepResult => ({ ok: false, error: UNREACHABLE }));
        if (result.ok) saved.push(c);
        else error = result.error;
      }
      if (error) {
        reports.push({ key: entry.key, label, status: "failed", error });
        const kept = saved.length > 0 && s.remaining ? s.remaining(record[entry.key], stage[entry.key], saved) : stage[entry.key];
        staged[entry.key] = kept as EditStage<M>[K];
      } else {
        reports.push({ key: entry.key, label, status: "saved" });
        next[entry.key] = s.apply(record[entry.key], stage[entry.key]) as EditRecord<M>[K];
      }
    }
    return { sections: reports, staged, record: next };
  }

  return { changes, plan, run, label: (key: K) => section(key).label };
}
