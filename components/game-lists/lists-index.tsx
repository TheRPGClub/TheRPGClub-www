import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import type { ListsIndexPage } from "@/lib/game-lists/index-page";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { ClubListPanel } from "@/components/game-lists/club-list-panel";
import { ListMosaic } from "@/components/game-lists/list-mosaic";
import { ListSearch } from "@/components/game-lists/list-search";

// The /lists index (pick: 1A's club feature panels over 1C's members'
// mosaics). The club's lists come first, then members' lists, most
// recently changed first. One search box finds lists by name, member or
// game.
export function ListsIndex({ page, q, badge }: { page: ListsIndexPage; q: string; badge?: ReactNode }) {
  const { club, members, covers, hits, game } = page;
  const searching = q !== "" || game !== null;
  const lead = game?.game_id ?? null;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lists"
        badge={badge}
        count={`${page.total} Game ${page.total === 1 ? "List" : "Lists"}`}
        actions={
          <ButtonLink href={game ? `/lists/new?game=${game.game_id}` : "/lists/new"} variant="highlight">
            <Plus aria-hidden />
            New list
          </ButtonLink>
        }
      />
      <ListSearch key={`${q}|${lead ?? ""}`} q={q} game={game} />

      {searching && club.length === 0 && members.length === 0 && (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-faint-foreground">
          No Game Lists match {game ? `${game.title}${q ? ` and "${q}"` : ""}` : `"${q}"`}.
        </p>
      )}

      {club.length > 0 && (
        <section aria-labelledby="club-lists" className="space-y-5 pt-2">
          <SectionHeading title={<span id="club-lists">The club&apos;s lists</span>} count="Kept by the Moderators" />
          <div className="grid gap-5 lg:grid-cols-2">
            {club.map((list) => (
              <ClubListPanel key={list.id} list={list} covers={covers.get(list.id) ?? list.preview_games} hit={hits.get(list.id)} />
            ))}
          </div>
        </section>
      )}

      {members.length > 0 && (
        <section aria-labelledby="member-lists" className="space-y-5 pt-2">
          <SectionHeading title={<span id="member-lists">Members&apos; lists</span>} count={searching ? `${members.length} found` : undefined} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {members.map((list) => (
              <ListMosaic key={list.id} list={list} covers={covers.get(list.id)} leadGameId={lead} hit={hits.get(list.id)} />
            ))}
          </div>
        </section>
      )}

      {!searching && club.length === 0 && members.length === 0 && (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-faint-foreground">
          No Game Lists yet. Make the first: a top 10, a backlog, a theme.
        </p>
      )}
    </div>
  );
}
