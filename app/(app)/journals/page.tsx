import { apiFetch } from "@/lib/api";
import { requireAuth } from "@/lib/session";
import type { ApiSingle, GameSummary } from "@/lib/api/types";
import {
  fetchJournalContributors,
  fetchJournaledGames,
  searchJournalEntries,
} from "@/lib/api/journals";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { memberName } from "@/lib/achievements";
import { sortChapters } from "@/lib/journals";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader, SectionHeading } from "@/components/issue/page-header";
import { JournalCatalogue } from "@/components/journal/journal-catalogue";
import { JournalCatalogueFilters } from "@/components/journal/journal-catalogue-filters";
import { JournalShelf, JournalVolumePreview } from "@/components/journal/journal-shelf";

// Every member's Game Journal: the archive (a shelf of member volumes, most
// games journaled first, with the pulled volume's title page beside it) over
// the catalogue, a search across every entry.
//
// ?vol=<member> pulls a volume, ?shelf=all stands every volume up, and
// ?q= / ?by=<member> / ?game=<id> / ?page= drive the catalogue.

const SHELF_VOLUMES = 10;
const CATALOGUE_PER_PAGE = 20;

async function readGameTitle(gameId: number): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSingle<GameSummary>).data.title;
  } catch {
    return null;
  }
}

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAuth();
  const query = await searchParams;
  const q = (firstParam(query.q) ?? "").trim();
  const by = firstParam(query.by) || null;
  const gameParam = parseInt(firstParam(query.game) ?? "", 10);
  const gameId = Number.isInteger(gameParam) && gameParam > 0 ? gameParam : null;
  const page = Math.max(1, parseInt(firstParam(query.page) ?? "1", 10) || 1);
  const wholeShelf = firstParam(query.shelf) === "all";
  const volParam = firstParam(query.vol) || null;

  // With no filter the catalogue's own count is the whole archive's, so the
  // separate count read is only for a filtered search.
  const filtered = Boolean(q || by || gameId);
  const [contributors, everything, results, gameTitle, volGames] = await Promise.all([
    fetchJournalContributors(),
    filtered ? searchJournalEntries({ per: 1 }) : null,
    searchJournalEntries({
      q: q || undefined,
      userId: by ?? undefined,
      gameId: gameId ?? undefined,
      page,
      per: CATALOGUE_PER_PAGE,
    }),
    gameId ? readGameTitle(gameId) : Promise.resolve(null),
    // The pulled volume's games, when the URL names it: read alongside.
    volParam ? fetchJournaledGames(volParam) : null,
  ]);

  const people = contributors?.data ?? [];
  const pulled = people.find((c) => c.user_id === volParam) ?? people[0] ?? null;
  const pulledGames = !pulled
    ? null
    : pulled.user_id === volParam
      ? volGames
      : await fetchJournaledGames(pulled.user_id);
  const onShelf = wholeShelf ? people : people.slice(0, SHELF_VOLUMES);

  // The page's own params, kept as volumes are pulled and searches change.
  const kept: Record<string, string> = {};
  if (q) kept.q = q;
  if (by) kept.by = by;
  if (gameId) kept.game = String(gameId);
  if (wholeShelf) kept.shelf = "all";
  if (volParam) kept.vol = volParam;
  const href = (changes: Record<string, string | null>, hash = "") => {
    const next = new URLSearchParams(kept);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    return `/journals${qs ? `?${qs}` : ""}${hash}`;
  };

  const entryTotal = (filtered ? everything : results)?.meta.count ?? null;
  const contributorTotal = contributors?.meta.count ?? people.length;
  const found = results?.meta.count ?? 0;

  return (
    <div className="space-y-6.5">
      <PageHeader
        title="Game Journals"
        count={
          entryTotal != null
            ? `${entryTotal} ${entryTotal === 1 ? "entry" : "entries"} · ${contributorTotal} ${contributorTotal === 1 ? "contributor" : "contributors"}`
            : undefined
        }
      />

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="journal-archive" className="min-w-0">
          <SectionHeading
            title={<span id="journal-archive">The archive</span>}
            count="One volume per member · most games first"
          />
          {contributors === null ? (
            <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
              The archive couldn&apos;t be loaded right now.
            </p>
          ) : people.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
              No one has journaled a game yet. Start yours from your profile&apos;s Journal.
            </p>
          ) : (
            <JournalShelf
              contributors={onShelf}
              pulledId={pulled?.user_id ?? null}
              hrefFor={(userId) => href({ vol: userId })}
              more={
                wholeShelf
                  ? undefined
                  : { count: people.length - onShelf.length, href: href({ shelf: "all" }) }
              }
            />
          )}
        </section>
        {pulled && <JournalVolumePreview contributor={pulled} games={pulledGames ? sortChapters(pulledGames.data) : null} />}
      </div>

      <section id="catalogue" aria-labelledby="journal-catalogue" className="scroll-mt-20">
        <SectionHeading
          title={<span id="journal-catalogue">Catalogue</span>}
          count="Search every entry"
        />
        <JournalCatalogueFilters
          q={q}
          by={by}
          game={gameId ? { id: gameId, title: gameTitle ?? `Game ${gameId}` } : null}
          members={people.map((c) => ({ id: c.user_id, name: memberName(c) }))}
          resultLabel={results ? `${found} ${found === 1 ? "entry" : "entries"}` : ""}
          current={kept}
        />
        {results === null ? (
          <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
            The catalogue couldn&apos;t be searched right now.
          </p>
        ) : results.data.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-6 text-sm text-paper-mute">
            {filtered ? "No entries match that search." : "No entries yet."}
          </p>
        ) : (
          <>
            <JournalCatalogue entries={results.data} q={q} />
            <div className="mt-5">
              <ListPagination
                currentPage={results.meta.page}
                totalPages={results.meta.pages}
                buildHref={(p) => href({ page: p > 1 ? String(p) : null }, "#catalogue")}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
