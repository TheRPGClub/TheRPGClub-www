"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

import type { PatchScopeState } from "@/hooks/use-patch-scope";
import type { PendingChange } from "@/lib/patch-notes/pending-changes";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PendingChangeRow } from "./pending-change-row";
import { PatchScopeEmpty } from "./patch-scope-empty";

// Step 1, "What's in it" (www#240, pn-editor-steps): the open Pending
// Changes and the ones this Patch covers, under New, Improved and Fixed
// heads set as the Patch sets them, each ticked to cover or dismissed;
// the dismissed ones fold away below with Undo. Before versioning there is
// nothing at all, and the empty panel says so.
export function PatchScope({
  number,
  state,
  drafting,
  onWrite,
}: {
  number: number;
  state: PatchScopeState;
  // The text is still the untouched template, so ticking redrafts it.
  drafting: boolean;
  onWrite: () => void;
}) {
  const { scope } = state;
  const [showDismissed, setShowDismissed] = useState(false);
  if (scope && scope.offered === 0 && scope.dismissed.length === 0) return <PatchScopeEmpty onWrite={onWrite} />;

  const row = (change: PendingChange) => (
    <PendingChangeRow
      key={change.id}
      change={change}
      busy={state.busy === change.id}
      locked={state.busy !== null}
      onTick={(on) => state.tick(change.id, on)}
      onDismiss={(undo) => {
        if (!undo) setShowDismissed(true);
        state.dismiss(change.id, undo);
      }}
    />
  );

  return (
    <section aria-labelledby="patch-scope" className="flex max-w-[52rem] flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-foreground pb-3">
        <div className="flex max-w-[38rem] flex-col gap-1.5">
          <h2 id="patch-scope" className="font-headline text-[1.75rem] leading-none uppercase">
            What Patch {number} covers
          </h2>
          <p className="text-[0.9375rem] text-dim-foreground">
            Tick each change this Patch writes up. Dismiss one members needn&apos;t hear about, and it stays out of later
            Patches.
          </p>
        </div>
        {scope && scope.offered > 0 && (
          <p className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground">
            <span className="font-headline mr-1 align-[-2px] text-[1.375rem] tracking-normal text-foreground">{scope.covered.length}</span>
            of {scope.offered} ticked
          </p>
        )}
      </header>
      {state.error && (
        <p role="alert" className="-mt-4 text-[0.875rem] text-destructive">
          {state.error}
        </p>
      )}
      {!scope ? (
        <p className="rounded-[3px] border border-dashed border-border-strong px-5 py-4 text-[0.9375rem] text-dim-foreground">
          Couldn&apos;t load the Pending Changes. Reload to try again; writing the Patch works without them.
        </p>
      ) : scope.offered === 0 ? (
        <p className="rounded-[3px] border border-dashed border-border-strong px-5 py-4 text-[0.9375rem] text-dim-foreground">
          Nothing open: every Pending Change is dismissed. Undo one below to put it back, or write the Patch yourself.
        </p>
      ) : (
        scope.sections.map((section) => (
          <section key={section.key} aria-labelledby={`patch-scope-${section.key}`} className="flex flex-col">
            <h3
              id={`patch-scope-${section.key}`}
              className="font-headline flex items-baseline justify-between border-b-2 border-foreground pb-[7px] text-[1.375rem] leading-none uppercase"
            >
              {section.label}
              <span className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground">
                {section.changes.filter((c) => c.status === "covered").length} of {section.changes.length}
              </span>
            </h3>
            <ul>{section.changes.map(row)}</ul>
          </section>
        ))
      )}
      {scope && scope.dismissed.length > 0 && (
        <Collapsible open={showDismissed} onOpenChange={setShowDismissed} className="flex flex-col">
          <CollapsibleTrigger render={<Button type="button" variant="quiet-link" size="sm" className="self-start px-0" />}>
            <ChevronRight aria-hidden className="motion-safe:transition-transform in-aria-expanded:rotate-90" />
            Dismissed · {scope.dismissed.length}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 border-t border-border">{scope.dismissed.map(row)}</ul>
          </CollapsibleContent>
        </Collapsible>
      )}
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-4">
        <p className="max-w-[34rem] text-[0.8125rem] text-faint-foreground">
          {drafting
            ? "The text is still the starting draft, so its New, Improved and Fixed bullets follow what you tick."
            : "You've written in the text, so ticking no longer changes it: what a Patch covers and what it says are kept apart."}
        </p>
        <Button type="button" variant="highlight" onClick={onWrite}>
          Go to 2 · Write it
          <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
      </footer>
    </section>
  );
}
