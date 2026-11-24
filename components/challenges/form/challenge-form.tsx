"use client";

import { Loader2, Lock } from "lucide-react";
import type { ChallengeDraft } from "@/lib/challenges/form";
import type { ChallengeTint } from "@/lib/challenges/types";
import { CURATED_TINTS, tintStyle } from "@/lib/challenges/tint";
import { useChallengeForm, type EditTarget } from "@/hooks/use-challenge-form";
import { PageHeader } from "@/components/templates/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormatCards } from "@/components/challenges/form/format-cards";
import { MetaFields } from "@/components/challenges/form/meta-fields";
import { PoolBuilder } from "@/components/challenges/form/pool-builder";
import { RuleSentence } from "@/components/challenges/form/rule-sentence";
import { WordEditor } from "@/components/challenges/form/word-editor";
import { AssignmentRules } from "@/components/challenges/form/assignment-rules";
import { SlotsSentence } from "@/components/challenges/form/slots-sentence";
import { YearRuler } from "@/components/challenges/form/year-ruler";

// Create or edit a Challenge (surface brief challenges-form, 5D's sentence
// with 5C's covers): the Format as three cards, the rules as one sentence of
// underlined words whose controls open beneath it, the Pool it means as a
// cover wall (Slots: its years on a ruler), then the name, description and
// Host. Once a Run exists the
// rules are locked and only the name, description and end date change,
// except a Pool's games, sources and target (spec api#442). The Challenge's
// tint rings Core Games (a new one shows cobalt until the API gives it one).
export function ChallengeForm({
  initial,
  edit,
  staff,
  runCount,
  badge,
  tint,
}: {
  initial: ChallengeDraft;
  edit: EditTarget | null;
  staff: boolean;
  runCount: number;
  badge?: React.ReactNode;
  tint?: ChallengeTint;
}) {
  const form = useChallengeForm(initial, edit);
  const cancelHref = edit ? `/challenges/${edit.id}` : "/challenges";
  return (
    <div style={tintStyle(tint ?? CURATED_TINTS.cobalt)} className="space-y-6 pb-12">
      <PageHeader
        back={{ href: cancelHref, label: edit ? initial.name || "Challenge" : "Challenges" }}
        title={edit ? "Edit Challenge" : "New Challenge"}
        badge={badge}
        actions={
          <>
            <ButtonLink href={cancelHref} variant="ghost">
              Cancel
            </ButtonLink>
            <Button
              type="button"
              variant="highlight"
              onClick={form.save}
              disabled={form.saving}
              className="min-w-[11rem]"
            >
              {form.saving && <Loader2 aria-hidden className="motion-safe:animate-spin" />}
              {edit ? "Save" : "Create Challenge"}
            </Button>
          </>
        }
      />
      {form.error && (
        <p role="alert" className="rounded-md border border-dashed border-destructive px-4 py-3 text-destructive">
          {form.error}
        </p>
      )}
      <FormatCards
        value={form.draft.format}
        onChange={(format) => form.update({ format })}
        staff={staff}
        locked={form.locked}
      />
      {form.draft.format === "pool" || form.draft.format === "slots" ? (
        <div>
          {form.draft.format === "slots" ? <SlotsSentence form={form} /> : <RuleSentence form={form} />}
          <WordEditor form={form} />
          {edit?.locked && <LockNote pool={form.draft.format === "pool"} runCount={runCount} />}
          {form.draft.format === "slots" ? <YearRuler form={form} /> : <PoolBuilder form={form} />}
        </div>
      ) : form.draft.format === "assignment" ? (
        <AssignmentRules form={form} runCount={runCount} />
      ) : (
        <p className="flex items-center gap-2.5 rounded-sm border border-dashed border-border-strong px-3.5 py-3 text-[0.92rem] text-dim-foreground">
          <Lock aria-hidden className="size-4 shrink-0" />
          This Format&apos;s rules are set from Discord for now. The name and description can change here.
        </p>
      )}
      <MetaFields form={form} canHostForClub={staff && !edit} />
    </div>
  );
}

// Once Runs exist: what is locked, and for a Pool, what stays open.
function LockNote({ pool, runCount }: { pool: boolean; runCount: number }) {
  const runs = `${runCount} ${runCount === 1 ? "Run has" : "Runs have"} started`;
  return (
    <p className="mt-3 flex items-center gap-2.5 rounded-sm border border-dashed border-border-strong px-3.5 py-3 text-[0.92rem] text-dim-foreground">
      <Lock aria-hidden className="size-4 shrink-0" />
      {pool
        ? `The Format and schedule are locked because ${runs}. Core and Optional Games, sources and the target stay editable. Adding a Core Game or raising the target sends a DM to members with an active Run.`
        : runCount > 0
          ? `The rules are locked because ${runs}. The name, description and end date can still change.`
          : "The rules are locked. The name, description and end date can still change."}
    </p>
  );
}
