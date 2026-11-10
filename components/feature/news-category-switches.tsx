"use client";

import { useId, useOptimistic, useState, useTransition } from "react";
import { saveNewsCategoryAction } from "@/app/actions/news-category-preferences";
import {
  applyNewsCategoryChange,
  type NewsCategoryChange,
  type NewsCategoryPreferences,
} from "@/lib/news-category-preferences";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { cn } from "@/lib/utils";

const SAVE_FAILED = "Couldn't save that switch. Try again.";

// The News Hub's own switches, indented under its Feature row on a paper-mute
// rule: one line on what they do, then one plain row per News Category in
// the API's order, each with its ink square. They save on flip exactly like
// the Feature switches (optimistic, Saving while the API answers, back with
// the reason on failure). While the member has the News Hub itself hidden
// they stay in place but dimmed and inert, with the reason in one line.
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
    <div className="mt-3 ml-1 border-l border-paper-mute pl-4 sm:ml-2 sm:pl-5">
      <p id={introId} className="max-w-[60ch] text-sm text-paper-dim">
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
        <p role="alert" className="mt-2 text-sm text-paper-dim">
          Couldn&apos;t load your News Categories. Reload the page to try again.
        </p>
      )}
      {initial && unavailable && (
        <p id={reasonId} className="mt-2 text-sm text-paper-dim">
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
  const [prefs, applyOptimistic] = useOptimistic(initial, applyNewsCategoryChange);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [, startTransition] = useTransition();

  function save(change: NewsCategoryChange) {
    const key = change.key;
    setPending((s) => new Set(s).add(key));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });

    startTransition(async () => {
      applyOptimistic(change);
      let result: Awaited<ReturnType<typeof saveNewsCategoryAction>>;
      try {
        result = await saveNewsCategoryAction(change);
      } catch {
        result = { ok: false, error: SAVE_FAILED };
      }
      if (!result.ok) {
        setErrors((e) => ({ ...e, [key]: result.error ?? SAVE_FAILED }));
      }
      setPending((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
    });
  }

  return (
    <ul aria-label="News Categories" aria-describedby={introId} className="mt-1.5">
      {prefs.categories.map((c) => {
        const on = !c.hidden;
        const nameId = `news-cat-${c.key}-name`;
        return (
          <li key={c.key} className="border-b border-rule py-2.5 last:border-b-0">
            <div className="flex items-center justify-between gap-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <InkSquare categoryKey={c.key} dim={unavailable} />
                <span
                  id={nameId}
                  className={cn(
                    "font-label min-w-0 text-[0.95rem] font-bold transition-colors",
                    unavailable ? "text-paper-mute" : on ? "text-paper" : "text-paper-dim",
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

// A News Category's ink as a 16px square (globals.css `--color-news-<key>`;
// a key www has no ink for reads as General). Rumours carries a dashed inner
// edge, since it is unconfirmed news. It names the category; the switch, not
// the square, carries on and off. Whole class names, so Tailwind emits the
// news inks (it drops theme colours no class uses).
const INK_FILL: Readonly<Record<string, string>> = {
  announcements: "bg-news-announcements",
  releases: "bg-news-releases",
  emulation: "bg-news-emulation",
  industry: "bg-news-industry",
  hardware: "bg-news-hardware",
  rumours: "bg-news-rumours",
  general: "bg-news-general",
};

function InkSquare({ categoryKey, dim }: { categoryKey: string; dim: boolean }) {
  return (
    <i
      aria-hidden
      className={cn(
        "size-4 shrink-0 rounded-xs transition-opacity",
        Object.hasOwn(INK_FILL, categoryKey) ? INK_FILL[categoryKey] : INK_FILL.general,
        categoryKey === "rumours" && "outline-[1.5px] -outline-offset-[4px] outline-ink/70 outline-dashed",
        dim && "opacity-45",
      )}
    />
  );
}
