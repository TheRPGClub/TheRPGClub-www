import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { fetchAdminRounds } from "@/lib/api/admin-rounds";
import { paginationOf } from "@/lib/api/pagination";
import type { GotmRound, GotmRoundBlock, VotingCategory } from "@/lib/api/types";
import { requireAuth } from "@/lib/session";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { canUseTier, staffSection } from "@/lib/staff";
import { nextRoundDefaults, roundEditHref, TRACK_NAME, TRACKS, trackFromSlug } from "@/lib/rounds";
import { DeskHeader } from "@/components/templates/desk-header";
import { RoundForm } from "@/components/admin/rounds/round-form";
import { ListPagination } from "@/components/list-pagination";
import { StaffOnly } from "@/components/staff-only";
import { cn } from "@/lib/utils";

const SECTION = staffSection("rounds");
const PATH = "/admin/rounds";

function pageHref(page: number): string {
  return page > 1 ? `${PATH}?page=${page}` : PATH;
}

// The add form, prefilled for one track's round: `?track=nr-gotm&round=143&month=November 2026`.
function prefillHref(category: VotingCategory, round: GotmRound, monthYear: string): string {
  const ps = new URLSearchParams({ track: category === "gotm" ? "gotm" : "nr-gotm", round: String(round.round_number), month: monthYear });
  return `${PATH}?${ps}#add`;
}

// /admin/rounds: add a GOTM or NR-GOTM round by searching games, over the
// rounds on file, newest first, each track with its Edit link.
export default async function RoundsAdminPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const params = await searchParams;
  const pageParam = parseInt(firstParam(params.page) ?? "", 10);
  const page = Number.isFinite(pageParam) && pageParam > 1 ? pageParam : 1;
  const track = trackFromSlug(firstParam(params.track));
  const prefillRound = parseInt(firstParam(params.round) ?? "", 10);
  const prefillMonth = firstParam(params.month)?.trim();

  // The defaults come from the newest rounds, whatever page is listed.
  const [listed, newest] = await Promise.all([
    fetchAdminRounds(page),
    page === 1 ? null : fetchAdminRounds(1),
  ]);
  const head = (page === 1 ? listed : newest)?.rounds ?? [];
  const now = new Date();
  const defaults = {
    gotm: nextRoundDefaults(head, "gotm", now),
    nr_gotm: nextRoundDefaults(head, "nr_gotm", now),
  };
  const latest = head[0];
  const latestMonth = latest ? (latest.gotm?.month_year ?? latest.nr_gotm?.month_year) : null;
  const rounds = listed?.rounds ?? [];
  const { total, totalPages } = paginationOf(listed?.meta ?? undefined, rounds.length);

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          latest ? (
            <>
              <b>Latest Round {latest.round_number}</b>
              {latestMonth && <> · {latestMonth}</>}
              <br />
              {total} {total === 1 ? "round" : "rounds"} on file
            </>
          ) : (
            "No rounds on file yet"
          )
        }
      />

      <div id="add" className="mt-6.5 scroll-mt-20">
        <RoundForm
          // A new prefill link starts a fresh form.
          key={`${track ?? ""}-${prefillRound}-${prefillMonth ?? ""}`}
          defaults={defaults}
          prefill={
            track
              ? {
                  category: track,
                  roundNumber: Number.isFinite(prefillRound) && prefillRound > 0 ? prefillRound : undefined,
                  monthYear: prefillMonth || undefined,
                }
              : null
          }
        />
      </div>

      <section aria-labelledby="rounds-on-file" className="mt-12">
        <h2
          id="rounds-on-file"
          className="font-headline border-b-2 border-paper pb-1.5 text-[2rem] leading-none"
        >
          Rounds on file
        </h2>
        {listed === null ? (
          <p role="alert" className="mt-4 text-destructive">
            {"Couldn't load the rounds. Refresh to try again."}
          </p>
        ) : rounds.length === 0 ? (
          <p className="mt-4 text-paper-dim">No rounds yet. Add the first one above.</p>
        ) : (
          <ol>
            {rounds.map((round) => (
              <RoundRow key={round.round_number} round={round} />
            ))}
          </ol>
        )}
        <div className="mt-6">
          <ListPagination currentPage={page} totalPages={totalPages} buildHref={pageHref} />
        </div>
      </section>
    </div>
  );
}

function RoundRow({ round }: { round: GotmRound }) {
  const monthYear = round.gotm?.month_year ?? round.nr_gotm?.month_year ?? "";
  return (
    <li className="grid gap-3 border-b border-rule py-4 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
      <h3 className="flex items-baseline gap-3 md:block">
        <span className="font-headline block text-[3rem] leading-[0.8] md:text-[3.5rem]">{round.round_number}</span>
        <span className="font-label block text-[0.82rem] font-bold tracking-[0.08em] text-paper-mute md:mt-2">
          <span className="sr-only">Round {round.round_number}, </span>
          {monthYear}
        </span>
      </h3>
      {TRACKS.map((category) => (
        <TrackCell key={category} category={category} round={round} block={round[category]} monthYear={monthYear} />
      ))}
    </li>
  );
}

function TrackCell({
  category,
  round,
  block,
  monthYear,
}: {
  category: VotingCategory;
  round: GotmRound;
  block: GotmRoundBlock | null;
  monthYear: string;
}) {
  const label = TRACK_NAME[category];
  const games = block ? [...block.games].sort((a, b) => a.game_index - b.game_index) : [];
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-label text-[0.78rem] font-bold tracking-[0.08em]",
            category === "gotm" ? "text-gotm-soft" : "text-nr-soft",
          )}
        >
          {label}
        </span>
        {block ? (
          <Link
            href={roundEditHref(category, round.round_number)}
            className="font-label inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[0.8rem] font-bold tracking-[0.06em] text-paper-dim transition-colors hover:text-highlight focus-visible:ring-2 focus-visible:ring-highlight/60 focus-visible:outline-none"
            aria-label={`Edit ${label} round ${round.round_number}`}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Link>
        ) : (
          <Link
            href={prefillHref(category, round, monthYear)}
            className="font-label inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[0.8rem] font-bold tracking-[0.06em] text-paper-dim transition-colors hover:text-highlight focus-visible:ring-2 focus-visible:ring-highlight/60 focus-visible:outline-none"
            aria-label={`Add ${label} round ${round.round_number}`}
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </Link>
        )}
      </div>
      {!block ? (
        <p className="mt-1 text-[0.9rem] text-paper-mute">No {label} this round.</p>
      ) : games.length === 0 ? (
        <p className="mt-1 text-[0.9rem] text-paper-mute">No game (placeholder)</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {games.map((g) => (
            <li key={g.game_index} className="truncate font-semibold">
              {g.game?.title ?? `GameDB game ${g.gamedb_game_id ?? "?"}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
