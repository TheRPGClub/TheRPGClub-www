import type { Value } from "platejs";
import { resolvePending } from "./lore-story";

// The order the Lore desk saves in (www#125, design 5D; hooks/use-lore-
// desk.ts runs it with the actions in app/actions/codex-lore.ts). One rule
// drives it: a photo is never deleted before a story without it has saved,
// so a save that fails part way loses nothing.
//
// 1. A new entry is created, and an edit that adds photos saves first, each
//    with the story minus the photos not uploaded yet.
// 2. On such an edit, the photos taken out of the story come off, which
//    makes room for the new ones (an entry holds four).
// 3. The placed photos upload, one request each.
// 4. The story saves with their ids and urls in place. An edit that adds
//    nothing saves only here.
// 5. Last, any photo the saved story no longer places comes off.
// 6. Then its See also links.
//
// Saving again after a failure picks up where it stopped: the entry keeps
// its id, so it is never created twice, and an uploaded photo isn't sent
// again.

type Result = { ok: boolean; id?: number; error?: string; unsure?: boolean };

export interface LoreSavePlan {
  // The entry being written: null until a new one is created.
  entryId: number | null;
  // Whether the desk opened an existing entry, which may have photos to
  // take off.
  existing: boolean;
  value: Value;
  // The pending keys of the placed photos still to upload.
  adding: readonly string[];
  // Uploads so far, by pending key; the upload step adds to it.
  uploaded: ReadonlyMap<string, { id: number; url: string }>;
}

export interface LoreSaveSteps {
  save: (id: number | null, story: Value) => Promise<Result>;
  prune: (id: number, story: Value) => Promise<Result>;
  uploadEach: (id: number, keys: readonly string[]) => Promise<{ count: number; failed: boolean }>;
  saveLinks: (id: number) => Promise<string | null>;
  // Told the entry's id as soon as it exists, so a step that throws later
  // can't lead to the entry being created again.
  onEntry?: (id: number) => void;
}

export interface LoreSaveOutcome {
  // The entry's id once it exists, even when a later step failed.
  id: number | null;
  // Why the save stopped short; null when it all went through.
  error: string | null;
  // The create may have gone through without saying so.
  unsure?: boolean;
}

const RETRY = "That didn't save. Try again.";

export async function runLoreSave(plan: LoreSavePlan, steps: LoreSaveSteps): Promise<LoreSaveOutcome> {
  const story = () => resolvePending(plan.value, plan.uploaded);
  const created = plan.entryId === null;
  let id = plan.entryId;
  if (id === null || plan.adding.length > 0) {
    const first = await steps.save(id, story());
    if (!first.ok || !first.id) return { id, error: first.error ?? RETRY, unsure: first.unsure };
    id = first.id;
    steps.onEntry?.(id);
    if (!created) {
      const room = await steps.prune(id, story());
      if (!room.ok) {
        return { id, error: `The story is saved, but the photos you took out are still there, so the new ones can't go up yet: ${room.error ?? RETRY}` };
      }
    }
  }
  const upload = await steps.uploadEach(id, plan.adding);
  if (plan.adding.length === 0 ? !created : upload.count > 0) {
    const placed = await steps.save(id, story());
    if (!placed.ok) {
      const why = placed.error ?? RETRY;
      return {
        id,
        error: created ? `The Lore Entry is live, but its photos aren't in the story yet: ${why} Save again to place them, or delete it.` : why,
      };
    }
  }
  if (plan.existing || plan.uploaded.size > 0) {
    const pruned = await steps.prune(id, story());
    if (!pruned.ok) return { id, error: `The Lore Entry is saved, but a photo you took out is still stored: ${pruned.error ?? RETRY} Save again to remove it.` };
  }
  const linkError = await steps.saveLinks(id);
  if (linkError) return { id, error: `The Lore Entry is saved, but See also isn't: ${linkError}` };
  if (upload.failed) return { id, error: "The Lore Entry is saved, but a photo didn't upload. Retry it or remove it, then save again." };
  return { id, error: null };
}
