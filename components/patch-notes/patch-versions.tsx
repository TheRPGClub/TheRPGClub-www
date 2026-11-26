import Link from "next/link";

import { PATCH_NOTES_PATH } from "@/lib/patch-notes/paths";
import { versionLine, versionRows, type Versions } from "@/lib/patch-notes/versions";

// The current versions on Patch Notes (www#241, spec api#510), so a member
// can say which build they're on. Pure: the page reads them. Each piece
// draws nothing while the API has no versions.

// The Stack's right column, above the Patches list: Site / API / Bot, one
// ruled row each, the version in label type at the right.
export function PatchVersions({ versions }: { versions: Versions | null }) {
  const rows = versionRows(versions);
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="patch-versions-heading" className="mb-8">
      <h2
        id="patch-versions-heading"
        className="font-label mb-1.5 border-b-2 border-border-strong pb-2 text-[0.8125rem] font-bold tracking-[0.09em] text-dim-foreground"
      >
        Versions
      </h2>
      <dl>
        {rows.map((row) => (
          <div
            key={row.repo}
            className="flex items-baseline justify-between gap-4 border-b border-border py-1.75 text-[0.9375rem] leading-tight font-semibold"
          >
            <dt>{row.label}</dt>
            <dd className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground tabular-nums">
              {row.version}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// The Stack's page foot: "site 1.4.2 · api 1.12.0", linking to Patch Notes.
export function PatchVersionFoot({ versions }: { versions: Versions | null }) {
  const line = versionLine(versions, ["www", "api"]);
  if (!line) return null;
  return (
    <footer className="font-label mt-12 flex min-h-11 items-center border-t border-border text-xs font-bold tracking-[0.08em] text-faint-foreground">
      <Link
        href={PATCH_NOTES_PATH}
        className="tabular-nums underline decoration-border-strong underline-offset-4 transition-colors hover:text-highlight hover:decoration-highlight"
      >
        {line}
      </Link>
    </footer>
  );
}

