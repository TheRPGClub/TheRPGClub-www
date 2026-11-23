import type { GameEditSection } from "./engine";

// Game Threads: the Discord threads linked to the game. Admins and Regulars
// (the API's Regulars-or-staff gate) stage links of threads found by name
// and unlinks of Game Threads; Save all links first, then unlinks.

export interface ThreadRef {
  thread_id: string;
  thread_name: string;
}

export interface GameThreadRef extends ThreadRef {
  jump_url: string | null;
}

export interface ThreadsStage {
  link: ThreadRef[];
  unlink: string[];
}

export type ThreadCall = { kind: "thread.link"; thread: ThreadRef } | { kind: "thread.unlink"; threadId: string };

const isLinked = (loaded: GameThreadRef[], id: string) => loaded.some((t) => t.thread_id === id);

// The staged changes that would change the record.
function effective(loaded: GameThreadRef[], staged: ThreadsStage): ThreadsStage {
  return {
    link: staged.link.filter((t) => !isLinked(loaded, t.thread_id)),
    unlink: staged.unlink.filter((id) => isLinked(loaded, id)),
  };
}

export const threadsSection: GameEditSection<GameThreadRef[], ThreadsStage, ThreadCall> = {
  label: "Game Threads",
  access: "threads",
  changes: (loaded, staged) => {
    const e = effective(loaded, staged);
    return e.link.length + e.unlink.length;
  },
  plan: (loaded, staged) => {
    const e = effective(loaded, staged);
    return [
      ...e.link.map((thread) => ({ kind: "thread.link" as const, thread })),
      ...e.unlink.map((threadId) => ({ kind: "thread.unlink" as const, threadId })),
    ];
  },
  apply: (loaded, staged) => {
    const e = effective(loaded, staged);
    return [
      ...loaded.filter((t) => !e.unlink.includes(t.thread_id)),
      ...e.link.map((t) => ({ ...t, jump_url: null })),
    ];
  },
  remaining: (loaded, staged, saved) => {
    const done = new Set(saved.map((c) => (c.kind === "thread.link" ? `l${c.thread.thread_id}` : `u${c.threadId}`)));
    const e = effective(loaded, staged);
    return {
      link: e.link.filter((t) => !done.has(`l${t.thread_id}`)),
      unlink: e.unlink.filter((id) => !done.has(`u${id}`)),
    };
  },
};

// The stage, or undefined once nothing is left in it.
function tidy(stage: ThreadsStage): ThreadsStage | undefined {
  return stage.link.length + stage.unlink.length > 0 ? stage : undefined;
}

const EMPTY: ThreadsStage = { link: [], unlink: [] };

// Stages a link of `thread`. Linking a Game Thread staged for unlink undoes
// the unlink; linking one already linked or staged does nothing.
export function stageThreadLink(
  loaded: GameThreadRef[],
  staged: ThreadsStage | undefined,
  thread: ThreadRef,
): ThreadsStage | undefined {
  const s = staged ?? EMPTY;
  if (isLinked(loaded, thread.thread_id)) return tidy({ ...s, unlink: s.unlink.filter((id) => id !== thread.thread_id) });
  if (s.link.some((t) => t.thread_id === thread.thread_id)) return staged;
  return { ...s, link: [...s.link, { thread_id: thread.thread_id, thread_name: thread.thread_name }] };
}

// Stages an unlink of the Game Thread `threadId`.
export function stageThreadUnlink(
  loaded: GameThreadRef[],
  staged: ThreadsStage | undefined,
  threadId: string,
): ThreadsStage | undefined {
  const s = staged ?? EMPTY;
  if (!isLinked(loaded, threadId) || s.unlink.includes(threadId)) return staged;
  return { ...s, unlink: [...s.unlink, threadId] };
}

// Drops whatever is staged for `threadId` (the Undo, or the x on an Added row).
export function unstageThread(staged: ThreadsStage | undefined, threadId: string): ThreadsStage | undefined {
  if (!staged) return undefined;
  return tidy({
    link: staged.link.filter((t) => t.thread_id !== threadId),
    unlink: staged.unlink.filter((id) => id !== threadId),
  });
}

export type ThreadMark = "added" | "unlinking" | null;

// The section's list: the Game Threads, marked when staged for unlink, then
// the threads staged for linking.
export function threadsView(loaded: GameThreadRef[], staged: ThreadsStage | undefined): (GameThreadRef & { mark: ThreadMark })[] {
  const e = effective(loaded, staged ?? EMPTY);
  return [
    ...loaded.map((t) => ({ ...t, mark: e.unlink.includes(t.thread_id) ? ("unlinking" as const) : null })),
    ...e.link.map((t) => ({ ...t, jump_url: null, mark: "added" as const })),
  ];
}

// Whether a search result is on the game already, or staged to be.
export function threadPicked(loaded: GameThreadRef[], staged: ThreadsStage | undefined, threadId: string): boolean {
  if (isLinked(loaded, threadId)) return !staged?.unlink.includes(threadId);
  return !!staged?.link.some((t) => t.thread_id === threadId);
}
