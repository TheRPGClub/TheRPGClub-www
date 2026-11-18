import type { ReactNode } from "react";
import Link from "next/link";
import type { CodexEntry } from "@/lib/codex/types";
import { CODEX_PATH, FUN_FACTS_PATH, partCount } from "@/lib/codex/paths";
import { cardNumber, pageRange } from "@/lib/codex/wall";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { FunFactAdd } from "./fun-fact-add";
import { FunFactCard } from "./fun-fact-card";

// The Fun Facts wall (designs 4D and 5D, www#124): newest first, a page of
// index cards pinned four across, with the add panel above them for Regulars
// and staff.
export function FunFactsWall({
  facts,
  total,
  pages,
  page,
  per,
  canAdd,
  failed,
  badge,
}: {
  facts: CodexEntry[];
  total: number;
  pages: number;
  page: number;
  per: number;
  canAdd: boolean;
  failed: boolean;
  badge?: ReactNode;
}) {
  return (
    <div>
      <PageHeader title="Fun Facts" badge={badge} count={failed ? null : total} />
      {canAdd && (
        <div className="mt-6">
          <FunFactAdd />
        </div>
      )}
      {failed && (
        <p className="mt-8 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-dim-foreground">
          The Fun Facts couldn&apos;t be read just now. Try again in a moment.
        </p>
      )}
      {!failed && facts.length === 0 && (
        <p className="mt-8 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-dim-foreground">
          {page > 1 ? (
            <>
              There&apos;s no page {page}. <Link href={FUN_FACTS_PATH} className="underline underline-offset-4">Back to the newest</Link>.
            </>
          ) : canAdd ? (
            "The wall is empty. Add the first Fun Fact: it goes out as the next Daily Fun Fact."
          ) : (
            <>
              The wall is empty for now. <Link href={CODEX_PATH} className="underline underline-offset-4">Back to the Club Codex</Link>.
            </>
          )}
        </p>
      )}
      {facts.length > 0 && (
        <ol aria-label={partCount("fun_fact", total)} className="mt-10 grid gap-x-6.5 gap-y-8.5 px-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {facts.map((fact, i) => (
            <li key={fact.id} className="min-w-0">
              <FunFactCard fact={fact} number={cardNumber(total, page, per, i)} soft={fact.id % 3 === 2} />
            </li>
          ))}
        </ol>
      )}
      {facts.length > 0 && (
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="font-label text-[0.8125rem] font-bold tracking-[0.08em] text-faint-foreground">
            {pageRange(total, page, per, facts.length)}
          </p>
          <div>
            <ListPagination currentPage={page} totalPages={pages} buildHref={(p) => (p === 1 ? FUN_FACTS_PATH : `${FUN_FACTS_PATH}?page=${p}`)} />
          </div>
        </div>
      )}
    </div>
  );
}
