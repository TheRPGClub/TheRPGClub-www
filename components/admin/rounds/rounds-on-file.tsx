import type { GotmRound } from "@/lib/api/types";
import { ListPagination } from "@/components/list-pagination";
import { RoundList } from "./round-list";

const PATH = "/admin/rounds";

function pageHref(page: number): string {
  return page > 1 ? `${PATH}?page=${page}` : PATH;
}

// The desk's "Rounds on file" under the add form: the list, why it is
// empty, or that it couldn't be read (`rounds` null), with the pages.
export function RoundsOnFile({
  rounds,
  page,
  totalPages,
}: {
  rounds: GotmRound[] | null;
  page: number;
  totalPages: number;
}) {
  return (
    <section aria-labelledby="rounds-on-file" className="mt-12">
      <h2
        id="rounds-on-file"
        className="font-headline border-b-2 border-foreground pb-1.5 text-[2rem] leading-none"
      >
        Rounds on file
      </h2>
      {rounds === null ? (
        <p role="alert" className="mt-4 text-destructive">
          {"Couldn't load the rounds. Refresh to try again."}
        </p>
      ) : rounds.length === 0 ? (
        <p className="mt-4 text-dim-foreground">No rounds yet. Add the first one above.</p>
      ) : (
        <RoundList rounds={rounds} />
      )}
      <div className="mt-6">
        <ListPagination currentPage={page} totalPages={totalPages} buildHref={pageHref} />
      </div>
    </section>
  );
}
