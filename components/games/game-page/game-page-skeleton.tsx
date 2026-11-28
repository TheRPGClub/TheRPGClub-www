import { Skeleton } from "@/components/ui/skeleton";

// The row under the hero while Releases and Details stream in: each heading
// over a few lines.
export function FactsRowSkeleton() {
  return (
    <div data-slot="game-facts-row" className="mt-6.5 grid gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-8">
      {[4, 6].map((lines) => (
        <div key={lines} className="space-y-3">
          <Skeleton variant="control" className="h-7 w-28" />
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton variant="control" key={i} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

// The whole game page while the game is read: the hero plate with its panel,
// then the row under it.
export function GamePageSkeleton() {
  return (
    <div className="pb-8">
      <Skeleton variant="plate" className="bleed -mt-6 h-[560px]" />
      <FactsRowSkeleton />
    </div>
  );
}
