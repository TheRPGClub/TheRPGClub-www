// The Draft's autosave, apart from React so its timing can be tested with
// fake timers: every change restarts a short wait, and when the writer pauses
// the latest snapshot is saved. One save runs at a time; a change made while
// one is in flight is saved straight after it. A failed save keeps the
// snapshot and tries again after a longer wait, or at once on "Retry now".

export type AutosaveStatus =
  // Nothing new since the page opened.
  | { kind: "idle" }
  // Waiting for the writer to pause, or a save in flight.
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  // The last save failed; the next try is at `retryAt` (epoch ms).
  | { kind: "failed"; retryAt: number };

export interface AutosaveOptions<T> {
  // Resolves true when the server took it. A throw counts as a failure.
  save: (snapshot: T) => Promise<boolean>;
  onStatus: (status: AutosaveStatus) => void;
  // How long the writer must pause before a save.
  delayMs?: number;
  // How long after a failure before trying again.
  retryMs?: number;
  now?: () => number;
}

export const AUTOSAVE_DELAY_MS = 1200;
export const AUTOSAVE_RETRY_MS = 8000;

export interface Autosave<T> {
  change: (snapshot: T) => void;
  // Saves anything unsaved now and waits for it. True when nothing is left
  // unsaved (Publish waits on this).
  flush: () => Promise<boolean>;
  retryNow: () => void;
  // Whether a change has not reached the server yet.
  dirty: () => boolean;
  dispose: () => void;
}

export function createAutosave<T>({
  save,
  onStatus,
  delayMs = AUTOSAVE_DELAY_MS,
  retryMs = AUTOSAVE_RETRY_MS,
  now = Date.now,
}: AutosaveOptions<T>): Autosave<T> {
  let pending: { snapshot: T } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<boolean> | null = null;
  let disposed = false;

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const schedule = (ms: number) => {
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      void run();
    }, ms);
  };

  const run = async (): Promise<boolean> => {
    if (inFlight) {
      // A change landed mid-save: let that save finish, then save again.
      await inFlight;
      return pending ? run() : true;
    }
    if (!pending) return true;
    const { snapshot } = pending;
    pending = null;
    onStatus({ kind: "saving" });

    let ok = false;
    inFlight = save(snapshot).then(
      (result) => result,
      () => false,
    );
    try {
      ok = await inFlight;
    } finally {
      inFlight = null;
    }
    if (disposed) return ok;

    if (!ok) {
      // Keep the snapshot unless a newer one has already replaced it.
      pending ??= { snapshot };
      onStatus({ kind: "failed", retryAt: now() + retryMs });
      schedule(retryMs);
      return false;
    }
    if (pending) {
      // Typed on while it saved: the newer text still needs saving.
      schedule(delayMs);
      return false;
    }
    onStatus({ kind: "saved", at: now() });
    return true;
  };

  return {
    change(snapshot) {
      if (disposed) return;
      pending = { snapshot };
      onStatus({ kind: "saving" });
      schedule(delayMs);
    },
    async flush() {
      clearTimer();
      const ok = await run();
      return ok && pending === null;
    },
    retryNow() {
      clearTimer();
      void run();
    },
    dirty: () => pending !== null || inFlight !== null,
    dispose() {
      disposed = true;
      clearTimer();
    },
  };
}
