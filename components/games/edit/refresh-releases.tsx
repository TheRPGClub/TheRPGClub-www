"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import type { Release } from "@/lib/api/types";
import { refreshReleasesAction } from "@/app/actions/igdb";
import { loadReleasesAction } from "@/app/actions/game-edit-releases";
import { releaseRefreshSummary } from "@/lib/igdb";
import { Button } from "@/components/ui/button";

// "Refresh from IGDB" on the Releases tab (spec api#437): an action, not an
// edit, so it runs at once and then reloads the section. It waits while the
// section has staged changes, so it never clobbers them; the reason is its
// tooltip. What happened shows beside it.
export function RefreshReleases({
  gameId,
  dirty,
  onReload,
}: {
  gameId: number;
  dirty: boolean;
  onReload: (releases: Release[]) => void;
}) {
  const [pending, start] = useTransition();
  const [said, setSaid] = useState<{ text: string; bad?: boolean } | null>(null);

  function refresh() {
    setSaid(null);
    start(async () => {
      const result = await refreshReleasesAction(gameId);
      if (!result.ok || !result.data) {
        setSaid({ text: result.error ?? "Refresh failed.", bad: true });
        return;
      }
      const releases = await loadReleasesAction(gameId);
      if (releases) onReload(releases);
      setSaid({ text: releaseRefreshSummary(result.data.added).text });
    });
  }

  return (
    <>
      <span role="status" className={said?.bad ? "text-[0.84rem] text-destructive" : "text-[0.84rem] text-faint-foreground"}>
        {pending ? "Checking IGDB…" : said?.text}
      </span>
      <span title={dirty ? "Save or discard the Release changes first" : undefined}>
        <Button variant="outline" size="sm" disabled={dirty || pending} onClick={refresh}>
          <RefreshCw data-icon="inline-start" className={pending ? "motion-safe:animate-spin" : undefined} />
          Refresh from IGDB
        </Button>
      </span>
    </>
  );
}
