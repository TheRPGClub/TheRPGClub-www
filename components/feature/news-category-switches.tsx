"use client";

import { useId } from "react";
import { saveNewsCategoryAction } from "@/app/actions/news-category-preferences";
import {
  applyNewsCategoryChange,
  type NewsCategoryPreferences,
} from "@/lib/news-category-preferences";
import { newsInk } from "@/lib/news";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { InkSquare } from "@/components/news/ink-square";
import { useSwitchSaves } from "@/hooks/use-switch-saves";
import { cn } from "@/lib/utils";

// The News Hub's own switches, indented under its Feature row on a paper-mute
// rule: one line on what they do, then one plain row per News Category in
// the API's order, each with its ink square. They save on flip exactly like
// the Feature switches (useSwitchSaves). While the member has the News Hub
// itself hidden they stay in place but dimmed and inert, with the reason in
// one line.
// `prefs` null: the read failed, so the block says so instead.
export function NewsCategorySwitches({
  initial,
  unavailable,
}: {
  initial: NewsCategoryPreferences | null;
  unavailable: boolean;
}) {
  const id = useId();
  const introId = `${id}-intro`;
  const reasonId = `${id}-reason`;

  return (
    <div className="mt-3 ml-1 border-l border-faint-foreground pl-4 sm:ml-2 sm:pl-5">
      <p id={introId} className="max-w-[60ch] text-sm text-dim-foreground">
        Categories you see by default. Off ones stay in the News page filter.
      </p>
      {initial ? (
        <CategoryList
          initial={initial}
          unavailable={unavailable}
          introId={introId}
          reasonId={reasonId}
        />
      ) : (
        <p role="alert" className="mt-2 text-sm text-dim-foreground">
          Couldn&apos;t load your News Categories. Reload the page to try again.
        </p>
      )}
      {initial && unavailable && (
        <p id={reasonId} className="mt-2 text-sm text-dim-foreground">
          Show the News Hub to choose its categories.
        </p>
      )}
    </div>
  );
}

function CategoryList({
  initial,
  unavailable,
  introId,
  reasonId,
}: {
  initial: NewsCategoryPreferences;
  unavailable: boolean;
  introId: string;
  reasonId: string;
}) {
  const { state: prefs, pending, errors, save } = useSwitchSaves({
    initial,
    apply: applyNewsCategoryChange,
    action: saveNewsCategoryAction,
    idOf: (change) => change.key,
  });

  return (
    <ul aria-label="News Categories" aria-describedby={introId} className="mt-1.5">
      {prefs.categories.map((c) => {
        const on = !c.hidden;
        const nameId = `news-cat-${c.key}-name`;
        return (
          <li key={c.key} className="border-b border-border py-2.5 last:border-b-0">
            <div className="flex items-center justify-between gap-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <InkSquare
                  {...newsInk(c.key)}
                  className={cn("transition-opacity", unavailable && "opacity-45")}
                />
                <span
                  id={nameId}
                  className={cn(
                    "font-label min-w-0 text-[0.95rem] font-bold transition-colors",
                    unavailable ? "text-faint-foreground" : on ? "text-foreground" : "text-dim-foreground",
                  )}
                >
                  {c.name}
                </span>
              </div>
              <FeatureSwitch
                checked={on}
                pending={pending.has(c.key)}
                unavailable={unavailable}
                onChange={(next) => save({ key: c.key, on: next })}
                onLabel="On"
                offLabel="Off"
                labelledBy={nameId}
                describedBy={unavailable ? reasonId : undefined}
              />
            </div>
            {errors[c.key] && (
              <p role="alert" className="mt-1.5 text-sm text-destructive">
                {errors[c.key]}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
