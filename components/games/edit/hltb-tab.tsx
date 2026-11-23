"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight, Link2, RefreshCw } from "lucide-react";
import { lookupHltbAction } from "@/app/actions/hltb";
import { hltbFieldValue, hltbSection, type HltbField as Field, type HltbStage, type HltbTimes } from "@/lib/games/game-edit/hltb";
import { HLTB_FAILURE_COPY } from "@/lib/hltb";
import { Button } from "@/components/ui/button";
import { EditSection } from "@/components/games/edit/edit-section";
import { HltbField } from "@/components/games/edit/hltb-field";

const FIELDS: { key: Field; label: string }[] = [
  { key: "main", label: "Main story" },
  { key: "main_sides", label: "Main + Sides" },
  { key: "completionist", label: "Completionist" },
];

// The Time to beat tab (design www#156 round 3): the three HowLongToBeat
// times in hours and the matched page's link, staged until Save all, for
// when the lookup matched the wrong game. The lookup is an action: it runs at
// once, and is off while the tab has staged times so it can't clobber them.
export function HltbTab({
  gameId,
  loaded,
  staged,
  error,
  onStage,
  onReload,
}: {
  gameId: number;
  loaded: HltbTimes;
  staged: HltbStage | undefined;
  error?: string;
  onStage: (next: HltbStage | undefined) => void;
  onReload: (hltb: HltbTimes) => void;
}) {
  const [looking, startLookup] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const dirty = !!staged && hltbSection.changes(loaded, staged) > 0;

  const value = (f: Field) => staged?.[f] ?? (f === "url" ? (loaded?.url ?? "") : hltbFieldValue(loaded?.[f]));
  const edited = (f: Field) => !!staged && f in staged && hltbSection.changes(loaded, { [f]: staged[f] }) > 0;
  const set = (f: Field, v: string) => onStage({ ...staged, [f]: v });
  const undo = (f: Field) => {
    const rest = { ...staged };
    delete rest[f];
    onStage(Object.keys(rest).length > 0 ? rest : undefined);
  };

  function lookUp() {
    startLookup(async () => {
      const result = await lookupHltbAction(gameId);
      if (!result.ok) {
        const copy = HLTB_FAILURE_COPY[result.failure];
        setNote(`${copy.title} ${result.message ?? copy.body}`);
      } else if (!result.meta.saved) {
        setNote("HowLongToBeat found times, but they aren't saved until the game is six months old.");
      } else {
        onReload(result.data);
        setNote(result.meta.source === "hltb" ? "Looked up just now." : "These are the saved times; HowLongToBeat is searched only while none are saved.");
      }
    });
  }

  const lookup = (
    <Button
      variant="outline"
      size="sm"
      onClick={lookUp}
      disabled={dirty || looking}
      title={dirty ? "Save or discard the staged times first." : undefined}
    >
      <RefreshCw data-icon="inline-start" aria-hidden className={looking ? "motion-safe:animate-spin" : undefined} />
      {loaded ? "Look up again" : "Look up on HLTB"}
    </Button>
  );

  return (
    <EditSection title="HowLongToBeat" actions={lookup} error={error}>
      <p aria-live="polite" className="mb-3 text-[0.9rem] text-dim-foreground empty:hidden">
        {looking ? "Looking up on HowLongToBeat…" : note}
      </p>
      <div className="grid gap-3.5 sm:grid-cols-3 lg:grid-cols-[repeat(3,9.5rem)_minmax(0,1fr)]">
        {FIELDS.map(({ key, label }) => (
          <HltbField
            key={key}
            id={`hltb-${key}`}
            label={label}
            time
            value={value(key)}
            edited={edited(key)}
            onChange={(v) => set(key, v)}
            onUndo={() => undo(key)}
          />
        ))}
        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-3 lg:col-span-1">
          <HltbField id="hltb-url" label="HowLongToBeat page" value={value("url")} edited={edited("url")} onChange={(v) => set("url", v)} onUndo={() => undo("url")} />
          {/* The matched name belongs to the saved link: a staged new link clears it on save. */}
          {loaded?.name && !edited("url") && (
            <p className="flex items-center gap-1.5 text-[0.9rem] text-dim-foreground">
              <Link2 aria-hidden className="size-3.75 text-faint-foreground" />
              Matched <b className="font-semibold text-foreground">{loaded.name}</b>
              {loaded.url && (
                <a href={loaded.url} target="_blank" rel="noopener noreferrer" aria-label="Open on HowLongToBeat (new tab)">
                  <ArrowUpRight aria-hidden className="size-3.75 text-faint-foreground" />
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </EditSection>
  );
}
