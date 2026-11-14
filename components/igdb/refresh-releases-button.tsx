"use client";

import { useState, useTransition } from "react";
import { Check, CircleCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { refreshReleasesAction } from "@/app/actions/igdb";
import { releaseRefreshSummary } from "@/lib/igdb";
import { Button } from "@/components/ui/button";

type Outcome =
  | { state: "added" | "current"; text: string }
  | { state: "error"; text: string };

// "Refresh release info" in the game page's Details rail: re-reads the game's
// releases from IGDB, then prints what happened underneath (running, how many
// were added, or nothing new). The action revalidates the page, so new
// platforms show.
export function RefreshReleasesButton({ gameId }: { gameId: number }) {
  const [pending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function refresh() {
    setOutcome(null);
    startTransition(async () => {
      const result = await refreshReleasesAction(gameId);
      if (!result.ok || !result.data) {
        setOutcome({ state: "error", text: result.error ?? "Refresh failed." });
        return;
      }
      setOutcome(releaseRefreshSummary(result.data.added));
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={pending}
        onClick={refresh}
      >
        <RefreshCw data-icon="inline-start" />
        Refresh release info
      </Button>
      <div aria-live="polite">
        {pending ? (
          <Status label="Running">
            <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin" />
            Checking IGDB for releases
          </Status>
        ) : outcome?.state === "added" ? (
          <Status label="Added">
            <CircleCheck aria-hidden className="size-4 shrink-0 text-rarity-uncommon" />
            <b className="font-semibold text-foreground">{outcome.text}</b>
          </Status>
        ) : outcome?.state === "current" ? (
          <Status label="Up to date">
            <Check aria-hidden className="size-4 shrink-0" />
            {outcome.text}
          </Status>
        ) : outcome?.state === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {outcome.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Status({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 rounded-[2.4px] bg-card px-3 py-2.5 text-[0.9rem] text-dim-foreground">
      <span className="font-label w-18 shrink-0 text-[0.78rem] tracking-[0.06em] text-faint-foreground">
        {label}
      </span>
      {children}
    </p>
  );
}
