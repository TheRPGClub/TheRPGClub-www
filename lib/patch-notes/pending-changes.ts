// Pending Changes as the Patch editor's step 1 shows them (www#240, API
// api#514): a merged change waiting to be written up in a Patch or
// dismissed. Client-safe and pure.

export type PendingChangeSection = "new" | "improved" | "fixed";
export type PendingChangeStatus = "open" | "covered" | "dismissed";
export type PendingChangeRepo = "api" | "bot" | "www";

export interface PendingChange {
  id: number;
  repo: PendingChangeRepo;
  pr_number: number;
  // The pull request title's type (feat, fix, perf, ...).
  type: string;
  title: string;
  version: string;
  // The pull request's "Patch note" line, if it had one.
  patch_note: string | null;
  section: PendingChangeSection;
  status: PendingChangeStatus;
  // The Patch that covers it, if any.
  patch_number: number | null;
  created_at: string;
}

// What a step 1 write answers: the change as it now stands (dismiss,
// undo), or every change the Patch now covers (cover), or the refusal in
// words.
export interface PendingChangeActionResult {
  ok: boolean;
  change?: PendingChange;
  covered?: PendingChange[];
  error?: string;
}

export const PENDING_SECTIONS: readonly { key: PendingChangeSection; label: string }[] = [
  { key: "new", label: "New" },
  { key: "improved", label: "Improved" },
  { key: "fixed", label: "Fixed" },
];

const REPOS: readonly PendingChangeRepo[] = ["www", "api", "bot"];
// How the site names each repo, as the Versions block does.
const REPO_NAMES: Record<PendingChangeRepo, string> = { www: "site", api: "api", bot: "bot" };

export function repoName(repo: PendingChangeRepo): string {
  return REPO_NAMES[repo];
}

function text(raw: unknown): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

// One item of a read, trusted only as far as its fields; null when it
// isn't a Pending Change.
export function pendingChangeValue(raw: unknown): PendingChange | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const repo = d.repo as PendingChangeRepo;
  const section = d.section as PendingChangeSection;
  const status = d.status as PendingChangeStatus;
  const title = text(d.title);
  if (typeof d.id !== "number" || !REPOS.includes(repo) || !title) return null;
  if (!["new", "improved", "fixed"].includes(section) || !["open", "covered", "dismissed"].includes(status)) return null;
  return {
    id: d.id,
    repo,
    pr_number: typeof d.pr_number === "number" ? d.pr_number : 0,
    type: text(d.type) ?? "",
    title,
    version: text(d.version) ?? "",
    patch_note: text(d.patch_note),
    section,
    status,
    patch_number: typeof d.patch_number === "number" ? d.patch_number : null,
    created_at: typeof d.created_at === "string" ? d.created_at : "",
  };
}

export function pendingChangesValue(raw: unknown): PendingChange[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(pendingChangeValue).filter((c): c is PendingChange => c !== null);
}

// The bullet a covered change drafts: its Patch note line, else its title.
export function pendingChangeLine(change: Pick<PendingChange, "patch_note" | "title">): string {
  return text(change.patch_note) ?? change.title.trim();
}

// Oldest first, the order they were merged in.
export function mergeOrder<T extends Pick<PendingChange, "id" | "created_at">>(changes: readonly T[]): T[] {
  return [...changes].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
}

export interface PatchScope {
  // Open ones and the ones this Patch covers, by section (newest first).
  sections: { key: PendingChangeSection; label: string; changes: PendingChange[] }[];
  // Newest first.
  dismissed: PendingChange[];
  covered: PendingChange[];
  // Open plus covered: what step 1 offers.
  offered: number;
  // How many it covers from each repo, in the site's reading order.
  repos: { repo: PendingChangeRepo; name: string; count: number }[];
}

// Step 1 for Patch `number`: what it covers or could, sorted into New,
// Improved and Fixed, and what is dismissed. Ones another Patch covers are
// left out.
export function patchScope(changes: readonly PendingChange[], number: number): PatchScope {
  const newest = [...mergeOrder(changes)].reverse();
  const mine = (c: PendingChange) => c.status === "covered" && c.patch_number === number;
  const offered = newest.filter((c) => c.status === "open" || mine(c));
  const covered = newest.filter(mine);
  return {
    sections: PENDING_SECTIONS.map((s) => ({ ...s, changes: offered.filter((c) => c.section === s.key) })).filter(
      (s) => s.changes.length > 0,
    ),
    dismissed: newest.filter((c) => c.status === "dismissed"),
    covered,
    offered: offered.length,
    repos: REPOS.map((repo) => ({ repo, name: repoName(repo), count: covered.filter((c) => c.repo === repo).length })).filter(
      (r) => r.count > 0,
    ),
  };
}

// "1 Pending Change", "7 Pending Changes".
export function pendingCount(n: number): string {
  return `${n} Pending ${n === 1 ? "Change" : "Changes"}`;
}

// The list after a cover write: the ones the Patch now covers as answered,
// the ones it covered before but not now open again.
export function applyCover(changes: readonly PendingChange[], number: number, covered: readonly PendingChange[]): PendingChange[] {
  const now = new Map(covered.map((c) => [c.id, c]));
  return changes.map((c) => {
    const answered = now.get(c.id);
    if (answered) return answered;
    if (c.status === "covered" && c.patch_number === number) return { ...c, status: "open", patch_number: null };
    return c;
  });
}

// The list with one change replaced by its answer.
export function applyChange(changes: readonly PendingChange[], change: PendingChange): PendingChange[] {
  return changes.map((c) => (c.id === change.id ? change : c));
}

// Step 1's state line under its tab name; null scope is a failed read.
export function scopeNote(scope: PatchScope | null): { note: string; tone?: "live" | "bad" } {
  if (!scope) return { note: "Couldn't load", tone: "bad" };
  if (scope.offered + scope.dismissed.length === 0) return { note: "No Pending Changes yet" };
  if (scope.offered === 0) return { note: `None open · ${scope.dismissed.length} dismissed` };
  const covered = scope.covered.length;
  return { note: `${covered} of ${pendingCount(scope.offered)}`, tone: covered > 0 ? "live" : undefined };
}
