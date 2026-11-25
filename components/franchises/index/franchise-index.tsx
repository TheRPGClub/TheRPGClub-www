import { Suspense } from "react";
import { browseHref, type BrowseQuery } from "@/lib/franchises/browse";
import { PageHeader } from "@/components/templates/page-header";
import { FranchiseSearch } from "@/components/franchises/index/franchise-search";
import { FranchiseSortSwitch } from "@/components/franchises/index/franchise-sort";
import { LetterRail } from "@/components/franchises/index/letter-rail";
import { NewFranchiseButton } from "@/components/franchises/index/new-franchise-button";
import {
  FranchiseBoxWall,
  FranchiseWallSkeleton,
} from "@/components/franchises/index/franchise-wall";

const numberFormat = new Intl.NumberFormat("en-GB");

// /franchises (design pick: Wall of box sets with the shelf's tag): the
// head with the club's Franchise count and New Franchise for Regulars and
// above, "Find a Franchise" and the sort, then the wall beside its letter
// rail. The wall loads under its own skeleton, so a new search, letter or
// sort answers at once.
export function FranchiseIndex({
  query,
  total,
  canCreate,
}: {
  query: BrowseQuery;
  // Every Franchise in GameDB; null when the read failed.
  total: number | null;
  canCreate: boolean;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchises"
        count={total != null ? numberFormat.format(total) : undefined}
        actions={canCreate && <NewFranchiseButton />}
      />
      <div className="flex flex-wrap items-center gap-3.5">
        <FranchiseSearch q={query.q} sort={query.sort} href={browseHref(query)} />
        <FranchiseSortSwitch query={query} />
      </div>
      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_1.5rem] lg:gap-x-6 lg:space-y-0">
        <LetterRail query={query} />
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Suspense
            key={JSON.stringify(query)}
            fallback={<FranchiseWallSkeleton />}
          >
            <FranchiseBoxWall query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
