import type { ReactNode } from "react";
import Link from "next/link";
import type { CodexEntry } from "@/lib/codex/types";
import { CODEX_BACK, FUN_FACTS_PATH, partCount } from "@/lib/codex/paths";
import { cardNumber, pageRange } from "@/lib/codex/wall";
import { PageHeader } from "@/components/templates/page-header";
import { ListPagination } from "@/components/list-pagination";
import { FunFactAdd } from "./fun-fact-add";
import { FunFactGrid } from "./fun-fact-grid";
import { WallActions, WallProvider } from "./wall-state";

const SLIP = "mt-8 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-dim-foreground";

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
  const ids = facts.map((fact) => fact.id);
  const cards = facts.map((fact, i) => ({ fact, number: cardNumber(total, page, per, i) }));
  return (
    <WallProvider ids={ids}>
      <PageHeader
        back={CODEX_BACK}
        title="Fun Facts"
        badge={badge}
        count={failed ? null : partCount("fun_fact", total)}
        actions={<WallActions ids={ids} canAdd={canAdd} />}
      />
      {canAdd && (
        <div className="mt-6">
          <FunFactAdd />
        </div>
      )}
      {failed && <p className={SLIP}>The Fun Facts couldn&apos;t be read just now. Try again in a moment.</p>}
      {!failed && facts.length === 0 && (
        <p className={SLIP}>
          {page > 1 ? (
            <>
              There&apos;s no page {page}.{" "}
              <Link href={FUN_FACTS_PATH} className="text-foreground underline underline-offset-4">
                Back to the newest
              </Link>
            </>
          ) : (
            "No Fun Facts yet."
          )}
        </p>
      )}
      {cards.length > 0 && <FunFactGrid cards={cards} label={partCount("fun_fact", total)} />}
      {cards.length > 0 && (
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="font-label text-[0.8125rem] font-bold tracking-[0.08em] text-faint-foreground">
            {pageRange(total, page, per, facts.length)}
          </p>
          <div>
            <ListPagination
              currentPage={page}
              totalPages={pages}
              buildHref={(p) => (p === 1 ? FUN_FACTS_PATH : `${FUN_FACTS_PATH}?page=${p}`)}
            />
          </div>
        </div>
      )}
    </WallProvider>
  );
}
