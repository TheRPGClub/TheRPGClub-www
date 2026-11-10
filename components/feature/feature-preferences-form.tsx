"use client";

import { useOptimistic, useState, useTransition } from "react";
import { savePreferenceAction } from "@/app/actions/feature-preferences";
import {
  applyPreferenceChange,
  whereItShows,
  type FeaturePreferences,
  type PreferenceChange,
} from "@/lib/feature-preferences";
import { Chip } from "@/components/issue/chip";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { NewsCategorySwitches } from "@/components/feature/news-category-switches";
import type { NewsCategoryPreferences } from "@/lib/news-category-preferences";
import { cn } from "@/lib/utils";

const SHOW_PREVIEW = "show_preview";
const NEWS_HUB = "news_hub";

function changeId(change: PreferenceChange): string {
  return change.kind === "feature" ? change.key : SHOW_PREVIEW;
}

// The member's switches. Each saves the moment it is flipped: the switch
// moves at once (an optimistic change over the page's own read), holds while
// the API answers, and springs back with the reason if the save fails. The
// action refreshes the page, so `initial` is the API's fresh document once a
// save lands and the form follows it. Rows save independently, and a pending
// row keeps its optimistic position over a refresh another row brought in.
//
// The News Hub row carries its News Category switches nested under it. They
// render only when the API lists the News Hub (the member can use it), and
// go unavailable while the row's own switch, optimistic included, is Hidden.
export function FeaturePreferencesForm({
  initial,
  newsCategories,
}: {
  initial: FeaturePreferences;
  // The member's News Category Preferences; null when the read failed.
  newsCategories: NewsCategoryPreferences | null;
}) {
  const [prefs, applyOptimistic] = useOptimistic(initial, applyPreferenceChange);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [, startTransition] = useTransition();

  function save(change: PreferenceChange) {
    const id = changeId(change);
    setPending((s) => new Set(s).add(id));
    setErrors((e) => {
      if (!(id in e)) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });

    startTransition(async () => {
      applyOptimistic(change);
      let result: Awaited<ReturnType<typeof savePreferenceAction>>;
      try {
        result = await savePreferenceAction(change);
      } catch {
        result = { ok: false, error: "Couldn't save that switch. Try again." };
      }
      if (!result.ok) {
        setErrors((e) => ({ ...e, [id]: result.error ?? "Couldn't save that switch. Try again." }));
      }
      setPending((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    });
  }

  const staff = prefs.show_preview_features !== null;

  return (
    <>
      {prefs.features.length > 0 ? (
        <ul className="mt-4 border-t border-rule">
          {prefs.features.map((f) => {
            // Any key the API lists, including one www doesn't know yet.
            const key = f.key;
            const shown = !f.hidden;
            return (
              <PreferenceRow
                key={key}
                id={key}
                name={f.name}
                badge={f.preview ? <PreviewBadge /> : null}
                where={whereItShows(f.website)}
                dim={!shown}
                error={errors[key]}
                nested={
                  key === NEWS_HUB ? (
                    <NewsCategorySwitches initial={newsCategories} unavailable={!shown} />
                  ) : null
                }
              >
                <FeatureSwitch
                  checked={shown}
                  pending={pending.has(key)}
                  onChange={(next) => save({ kind: "feature", key, shown: next })}
                  onLabel="Shown"
                  offLabel="Hidden"
                  labelledBy={`pref-${key}-name`}
                  describedBy={`pref-${key}-where`}
                />
              </PreferenceRow>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-rule-strong px-4 py-5 text-sm text-paper-dim">
          Nothing to hide right now. Parts of the club you can hide will show up here once they&apos;re live.
        </p>
      )}

      {/* Staff only, so it sits apart from the member's own switches on a
          raised ink-2 panel rather than as one more row of the list. */}
      {staff && (
        <ul className="mt-8 rounded-md border border-rule bg-ink-2 px-4" aria-label="Staff">
          <PreferenceRow
            id={SHOW_PREVIEW}
            name="Show Preview features"
            badge={<Chip>Staff</Chip>}
            where="Preview Features in your sidebar, dashboard and pages. Turn it off to see the site as members do."
            dim={!prefs.show_preview_features}
            error={errors[SHOW_PREVIEW]}
            className="border-b-0"
          >
            <FeatureSwitch
              checked={prefs.show_preview_features === true}
              pending={pending.has(SHOW_PREVIEW)}
              onChange={(next) => save({ kind: "show_preview", shown: next })}
              onLabel="On"
              offLabel="Off"
              labelledBy={`pref-${SHOW_PREVIEW}-name`}
              describedBy={`pref-${SHOW_PREVIEW}-where`}
            />
          </PreferenceRow>
        </ul>
      )}
    </>
  );
}

function PreferenceRow({
  id,
  name,
  badge,
  where,
  dim,
  error,
  className,
  nested,
  children,
}: {
  id: string;
  name: string;
  badge: React.ReactNode;
  where: string;
  dim: boolean;
  error?: string;
  className?: string;
  // Sub-settings that belong to this row, under its error line.
  nested?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className={cn("border-b border-rule py-3.5", className)}>
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span
              id={`pref-${id}-name`}
              className={cn(
                "font-label text-[0.95rem] font-bold transition-colors",
                dim ? "text-paper-dim" : "text-paper",
              )}
            >
              {name}
            </span>
            {badge}
          </div>
          <p id={`pref-${id}-where`} className="mt-0.5 text-sm text-paper-dim">
            {where}
          </p>
        </div>
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {nested}
    </li>
  );
}
