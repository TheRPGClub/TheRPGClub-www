import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { CodexEntry } from "@/lib/codex/types";
import { LORE_PATH, NEW_LORE_PATH, partCount } from "@/lib/codex/paths";
import { pageRange } from "@/lib/codex/wall";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { LoreShelf } from "./lore-shelf";
import { LoreSlideOut } from "./lore-slide-out";

const SLIP = "rounded-md border border-dashed border-border-strong px-5 py-4 text-dim-foreground";

// Club Lore as a bookcase (www#125, design 4D): a page of Lore Entries as
// spines, the picked one slid out beside them, and Add a Lore Entry for
// Regulars and staff.
export function LoreShelfPage({
  entries,
  total,
  pages,
  page,
  per,
  picked,
  viewerId,
  canAdd,
  failed,
  badge,
}: {
  entries: CodexEntry[];
  total: number;
  pages: number;
  page: number;
  per: number;
  picked: number | null;
  viewerId: string | null;
  canAdd: boolean;
  failed: boolean;
  badge?: ReactNode;
}) {
  const add = canAdd && (
    <ButtonLink href={NEW_LORE_PATH} variant="highlight" className="w-full sm:w-auto">
      <Plus aria-hidden />
      Add a Lore Entry
    </ButtonLink>
  );
  const initial = entries.find((e) => e.id === picked)?.id ?? entries[0]?.id;
  const slides = Object.fromEntries(entries.map((entry) => [entry.id, <LoreSlideOut key={entry.id} entry={entry} />]));
  return (
    <>
      <PageHeader title="Club Lore" badge={badge} count={failed ? null : partCount("lore_entry", total)} actions={add} />
      <div className="mt-7">
        {failed && <p className={SLIP}>Club Lore couldn&apos;t be read just now. Try again in a moment.</p>}
        {!failed && initial === undefined && (
          <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_440px]">
            <div className="rounded-md bg-card px-7 pt-10">
              <div aria-hidden className="h-60" />
              <div aria-hidden className="-mx-7 h-4 bg-border-strong shadow-[0_8px_16px_rgb(0_0_0/0.5)]" />
              <div className="h-10" />
            </div>
            <div className={SLIP}>
              {page > 1 ? (
                <>
                  There&apos;s no page {page}.{" "}
                  <Link href={LORE_PATH} className="text-foreground underline underline-offset-4">
                    Back to the newest
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-headline text-2xl text-foreground">No Lore Entries yet.</p>
                  <p className="mt-1">Tell the first story.</p>
                  {add && <div className="mt-4">{add}</div>}
                </>
              )}
            </div>
          </div>
        )}
        {initial !== undefined && <LoreShelf entries={entries} slides={slides} initial={initial} viewerId={viewerId} />}
      </div>
      {initial !== undefined && pages > 1 && (
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="font-label text-[0.8125rem] font-bold tracking-[0.08em] text-faint-foreground">
            {pageRange(total, page, per, entries.length)}
          </p>
          <div>
            <ListPagination
              currentPage={page}
              totalPages={pages}
              buildHref={(p) => (p === 1 ? LORE_PATH : `${LORE_PATH}?page=${p}`)}
            />
          </div>
        </div>
      )}
    </>
  );
}
