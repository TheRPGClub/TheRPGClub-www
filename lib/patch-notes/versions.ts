// The club's current versions (GET /api/v1/versions, spec api#510): the
// version of each repo's newest Pending Change, null until versioning
// starts. Client-safe.
export interface Versions {
  api: string | null;
  bot: string | null;
  www: string | null;
}

export type VersionRepo = keyof Versions;

// How the site names each repo, in reading order: the website is the
// "site" a member is on.
const NAMES: Record<VersionRepo, { short: string; label: string }> = {
  www: { short: "site", label: "Site" },
  api: { short: "api", label: "API" },
  bot: { short: "bot", label: "Bot" },
};
const ORDER: readonly VersionRepo[] = ["www", "api", "bot"];

function clean(raw: unknown): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

// The read's `data`, trusted only as far as its three strings.
export function versionsValue(raw: unknown): Versions | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const versions = { api: clean(data.api), bot: clean(data.bot), www: clean(data.www) };
  return ORDER.some((repo) => versions[repo]) ? versions : null;
}

// The set versions as rows (Site / API / Bot), skipping the unset ones.
export function versionRows(versions: Versions | null): { repo: VersionRepo; label: string; version: string }[] {
  if (!versions) return [];
  return ORDER.flatMap((repo) => {
    const version = versions[repo];
    return version ? [{ repo, label: NAMES[repo].label, version }] : [];
  });
}

// "site 1.4.2 · api 1.12.0", for the given repos that have a version; null
// when none does.
export function versionLine(versions: Versions | null, repos: readonly VersionRepo[] = ORDER): string | null {
  const parts = versionRows(versions)
    .filter((row) => repos.includes(row.repo))
    .map((row) => `${NAMES[row.repo].short} ${row.version}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}
