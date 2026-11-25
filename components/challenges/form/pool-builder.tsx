"use client";

import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { useSortable } from "@/hooks/use-sortable";
import type { PoolSide } from "@/lib/challenges/pool-editor";
import { SortStatus } from "@/components/sortable/sort-status";
import { SearchProblemNote } from "@/components/search-problem-note";
import { PoolSearch } from "@/components/challenges/form/pool-search";
import { PoolSection } from "@/components/challenges/form/pool-section";
import { OptionalSources } from "@/components/challenges/form/optional-sources";
import { TargetStepper } from "@/components/challenges/form/target-stepper";
import { LeftOut } from "@/components/challenges/form/left-out";

// The Pool under the sentence (www#170, design pick 8): a search that adds
// a game as Core or Optional, then Core on top and Optional below as cover
// walls (8B's tiles), split by the rule. Optional carries its sources and the
// target stepper (8A); Left out sits under both. A cover moves by its switch
// or by dragging it onto the other section (the Make Room Rule; a section's
// order isn't the Host's to set). The Pool stays editable once Runs exist.
export function PoolBuilder({ form }: { form: ChallengeFormState }) {
  const { columns, preview, errors } = form;
  const all = [...columns.core, ...columns.optional];
  const lookup = new Map(all.map((g) => [g.game_id, g]));
  const sort = useSortable<PoolSide, number>({
    zones: { core: columns.core.map((g) => g.game_id), optional: columns.optional.map((g) => g.game_id) },
    layout: "grid",
    fixedOrder: true,
    name: (id) => lookup.get(id)?.title ?? "Game",
    zoneName: (z) => (z === "core" ? "Core" : "Optional"),
    onDrop: (_, move) => {
      const game = lookup.get(move.id);
      if (game && move.from !== move.to) form.moveGame(game, move.to);
    },
  });
  const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
  return (
    <section aria-labelledby="pool-heading" className="mt-[34px]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-foreground pb-2">
        <h2 id="pool-heading" className="font-headline text-[1.875rem]">
          The Pool
        </h2>
        <span className="font-label text-sm tracking-[0.08em] text-faint-foreground">
          {columns.core.length} Core · {preview.loading ? "…" : columns.optionalCount} Optional
        </span>
        <span className="ml-auto hidden text-[0.88rem] text-faint-foreground sm:inline">
          Drag a cover between Core and Optional, or use its switch.
        </span>
      </div>
      <PoolSearch form={form} />
      {preview.problem && <SearchProblemNote problem={preview.problem} className="mt-3" />}
      <div className="mt-5 space-y-7">
        <PoolSection
          side="core"
          title="Core"
          count={plural(columns.core.length, "game")}
          empty="No Core Games yet. Every Run must Clear each Core Game: add one with the search, or drag an Optional Game here."
          sort={sort}
          lookup={lookup}
          onMove={form.moveGame}
          onLeaveOut={form.leaveOut}
        >
          <p className="mt-2 text-[0.88rem] text-faint-foreground">Every Run must Clear all of these.</p>
        </PoolSection>
        <PoolSection
          side="optional"
          title="Optional"
          count={preview.loading ? "Counting…" : plural(columns.optionalCount, "game")}
          aside={<TargetStepper form={form} />}
          empty="No Optional Games yet. Add a Franchise or Series, search for a game, or drag a Core Game here."
          sort={sort}
          lookup={lookup}
          onMove={form.moveGame}
          onLeaveOut={form.leaveOut}
        >
          {errors.target && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {errors.target}
            </p>
          )}
          <OptionalSources form={form} />
        </PoolSection>
      </div>
      {errors.sources && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errors.sources}
        </p>
      )}
      <LeftOut games={columns.leftOut} onPutBack={form.putBack} />
      <SortStatus status={sort.status} />
    </section>
  );
}
