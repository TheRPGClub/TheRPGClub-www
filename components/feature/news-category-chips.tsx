"use client";

import { useId } from "react";
import { saveNewsCategoryAction } from "@/app/actions/news-category-preferences";
import { applyNewsCategoryChange, type NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { newsInk } from "@/lib/news";
import { SectionHeading } from "@/components/templates/page-header";
import { InkSquare } from "@/components/news/ink-square";
import { Toggle } from "@/components/ui/toggle";
import { useSwitchSaves } from "@/hooks/use-switch-saves";
import { cn } from "@/lib/utils";

// The News Hub's own settings on the Features tab: one chip per News
// Category in the API's order, each with its ink square, pressed while the
// category is on (an off one is struck through). A chip saves the moment it
// is pressed, like the Feature switches (useSwitchSaves): it holds while the
// API answers and springs back with the reason if the save fails. While the
// member has the News Hub itself hidden the chips stay but go inert, with the
// reason in one line. `initial` null: the read failed, so it says so.
export function NewsCategoryChips({
  initial,
  unavailable,
}: {
  initial: NewsCategoryPreferences | null;
  unavailable: boolean;
}) {
  const id = useId();
  const on = initial?.categories.filter((c) => !c.hidden).length;

  return (
    <section aria-labelledby={`${id}-title`}>
      <SectionHeading
        title={<span id={`${id}-title`}>News Categories</span>}
        count={initial && !unavailable ? `${on} of ${initial.categories.length} on` : undefined}
      />
      <p id={`${id}-intro`} className="mt-3 max-w-[60ch] text-sm text-dim-foreground">
        Categories you see by default. Off ones stay in the News page filter.
      </p>
      {initial ? (
        <Chips initial={initial} unavailable={unavailable} describedBy={`${id}-intro`} reasonId={`${id}-reason`} />
      ) : (
        <p role="alert" className="mt-3 text-sm text-dim-foreground">
          Couldn&apos;t load your News Categories. Reload the page to try again.
        </p>
      )}
      {initial && unavailable && (
        <p id={`${id}-reason`} className="mt-3 text-sm text-dim-foreground">
          Show the News Hub to choose its categories.
        </p>
      )}
    </section>
  );
}

function Chips({
  initial,
  unavailable,
  describedBy,
  reasonId,
}: {
  initial: NewsCategoryPreferences;
  unavailable: boolean;
  describedBy: string;
  reasonId: string;
}) {
  const { state, pending, errors, save } = useSwitchSaves({
    initial,
    apply: applyNewsCategoryChange,
    action: saveNewsCategoryAction,
    idOf: (change) => change.key,
  });
  const failed = state.categories.filter((c) => errors[c.key]);

  return (
    <>
      <ul aria-label="News Categories" aria-describedby={describedBy} className="mt-4 flex flex-wrap gap-2">
        {state.categories.map((c) => (
          <li key={c.key}>
            <Toggle
              variant="ink"
              size="lg"
              pressed={!c.hidden}
              aria-busy={pending.has(c.key) || undefined}
              aria-disabled={unavailable || undefined}
              aria-describedby={unavailable ? reasonId : undefined}
              onPressedChange={(next) => {
                if (!unavailable && !pending.has(c.key)) save({ key: c.key, on: next });
              }}
              className="gap-2 pr-3 pl-2.5"
            >
              <InkSquare {...newsInk(c.key)} className={cn(c.hidden && "opacity-45")} />
              {c.name}
            </Toggle>
          </li>
        ))}
      </ul>
      <p role="status" className="mt-2 text-sm text-dim-foreground empty:hidden">
        {pending.size > 0 ? "Saving" : ""}
      </p>
      {failed.map((c) => (
        <p key={c.key} role="alert" className="mt-2 text-sm text-destructive">
          {c.name}: {errors[c.key]}
        </p>
      ))}
    </>
  );
}
