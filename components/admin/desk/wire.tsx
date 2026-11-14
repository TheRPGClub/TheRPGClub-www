"use client";

import { RefreshCw } from "lucide-react";
import type { BotJob, CollectionMeta } from "@/lib/api/types";
import { useWire } from "@/hooks/use-wire";
import { WireSlip } from "@/components/admin/desk/wire-slip";
import { Button } from "@/components/ui/button";

// The wire: bot jobs newest first, each a slip with its time, what it did,
// and its Queued, Done or Failed stamp. Admins and Superadmins see every
// job (`scope="all"`, with who asked); Moderators only their own. While a
// job on it is still queued it re-reads itself a few times; "Older jobs"
// loads the next page. No retry: a failed job stays failed.
export function Wire({
  initialJobs,
  initialMeta,
  scope,
  initialError,
  className,
}: {
  initialJobs: BotJob[];
  initialMeta: CollectionMeta | null;
  scope: "all" | "mine";
  // Set when the first page couldn't be read.
  initialError?: string | null;
  className?: string;
}) {
  const { jobs, next, error, loading, refreshing, refresh, loadOlder } = useWire(
    initialJobs,
    initialMeta,
    initialError,
  );

  return (
    <aside aria-labelledby="wire-heading" className={className}>
      <div className="flex items-baseline gap-3 border-b-2 border-foreground pb-2">
        <h2 id="wire-heading" className="font-headline text-[1.9rem]">
          The wire
        </h2>
        <span className="font-label text-[0.85rem] tracking-[0.08em] text-faint-foreground">
          {scope === "all" ? "Every bot job" : "Your bot jobs"}
        </span>
        <Button
          type="button"
          variant="row"
          size="icon-sm"
          className="ml-auto self-center"
          onClick={refresh}
          disabled={refreshing}
          aria-label="Refresh the wire"
          title="Refresh the wire"
        >
          <RefreshCw className={refreshing ? "motion-safe:animate-spin" : undefined} />
        </Button>
      </div>

      {error && (
        <p role="alert" className="py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {jobs.length === 0 && !error ? (
        <p className="py-4 text-sm text-dim-foreground">
          {scope === "all"
            ? "Nothing on the wire yet. A job lands here when a tool asks the bot to do something in Discord."
            : "None of your bot jobs yet. A job lands here when a tool you use asks the bot to do something in Discord."}
        </p>
      ) : (
        <ol>
          {jobs.map((job) => (
            <li key={job.id}>
              <WireSlip job={job} showRequester={scope === "all"} />
            </li>
          ))}
        </ol>
      )}

      {next != null && (
        <Button type="button" variant="outline" size="sm" className="mt-4" disabled={loading} onClick={loadOlder}>
          {loading ? "Loading..." : "Older jobs"}
        </Button>
      )}
    </aside>
  );
}
