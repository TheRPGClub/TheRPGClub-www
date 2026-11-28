import Link from "next/link";
import { Plus } from "lucide-react";
import { billboardClock, countLine, emptyFilterLine, type BoardFilters } from "@/lib/challenges/board";
import type { BoardPage } from "@/lib/challenges/board-page";
import { PageHeader } from "@/components/templates/page-header";
import { ButtonLink } from "@/components/ui/button";
import { BoardFiltersBar } from "@/components/challenges/board-filters";
import { ChallengeBillboard } from "@/components/challenges/challenge-billboard";
import { ChallengeFlyer } from "@/components/challenges/challenge-flyer";

// The Challenges index (surface brief challenges-index): a pinboard of club
// flyers, with the running Challenges pasted up as billboards above the
// board. Members see what is on, how long is left and where they already
// have a Run.
export function ChallengeBoard({
  page,
  filters,
  canCreate,
  badge,
}: {
  page: BoardPage | null;
  filters: BoardFilters;
  canCreate: boolean;
  badge?: React.ReactNode;
}) {
  const create = canCreate && (
    <ButtonLink href="/challenges/new" variant="highlight">
      <Plus aria-hidden /> New Challenge
    </ButtonLink>
  );
  return (
    <div className="pb-12">
      <PageHeader title="Challenges" badge={badge} count={page ? countLine(page.all) : undefined} actions={create} />
      <div className="mt-[18px]">
        <BoardFiltersBar filters={filters} />
      </div>
      {!page ? (
        <Empty>The Challenges couldn&apos;t be read just now. Try again in a moment.</Empty>
      ) : page.all.length === 0 ? (
        <Empty action={create}>No Challenges yet.</Empty>
      ) : page.shown.length === 0 ? (
        <Empty
          action={
            <Link
              href="/challenges"
              className="font-label text-sm text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
            >
              Clear filters
            </Link>
          }
        >
          {emptyFilterLine(filters)}
        </Empty>
      ) : (
        <Board page={page} />
      )}
    </div>
  );
}

function Board({ page }: { page: BoardPage }) {
  const { board, extras, yourRuns, actions, today } = page;
  return (
    <>
      {board.billboards.length > 0 && (
        <section aria-label="Running now" className="mt-7 grid grid-cols-1 gap-[26px] lg:grid-cols-2">
          {board.billboards.map((c) => (
            <div key={c.id} className={board.billboards.length === 1 ? "lg:col-span-2" : undefined}>
              <ChallengeBillboard
                challenge={c}
                clock={billboardClock(c, today)!}
                extras={extras.get(c.id)}
                run={yourRuns.get(c.id)}
                action={actions.get(c.id)}
                today={today}
              />
            </div>
          ))}
        </section>
      )}
      {board.flyers.length > 0 && (
        <ul className="mt-10 grid grid-cols-1 items-start gap-x-[22px] gap-y-[30px] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {board.flyers.map((c) => (
            <li key={c.id}>
              <ChallengeFlyer
                challenge={c}
                extras={extras.get(c.id)}
                run={yourRuns.get(c.id)}
                action={actions.get(c.id)}
                today={today}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div data-slot="community-note" className="mt-8 flex flex-wrap items-center gap-4 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">
      <p>{children}</p>
      {action}
    </div>
  );
}
