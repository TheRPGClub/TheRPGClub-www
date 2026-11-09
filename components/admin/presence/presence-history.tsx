"use client";

import { useState, useTransition } from "react";
import { listPresenceAction } from "@/app/actions/presence";
import type { BotPresence, CollectionMeta } from "@/lib/api/types";
import { wireStamp } from "@/lib/bot-jobs";
import { presenceSetter } from "@/lib/presence";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";

// Every presence the bot has had, newest first, with who set it. The first
// row is the one it shows now.
export function PresenceHistory({
  initial,
  initialMeta,
  initialError,
}: {
  initial: BotPresence[];
  initialMeta: CollectionMeta | null;
  initialError: string | null;
}) {
  const isClient = useIsClient();
  const [rows, setRows] = useState(initial);
  const [next, setNext] = useState(initialMeta?.next ?? null);
  const [error, setError] = useState(initialError);
  const [loading, startLoading] = useTransition();
  // A new presence revalidates the page; take the fresh first page.
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setRows(initial);
    setNext(initialMeta?.next ?? null);
  }

  const loadOlder = () => {
    if (next == null) return;
    startLoading(async () => {
      const result = await listPresenceAction(next).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? "Lost touch with the club's server.");
        return;
      }
      const older = result.data;
      setRows((current) => [...current, ...older]);
      setNext(result.meta?.next ?? null);
      setError(null);
    });
  };

  return (
    <section id="history" aria-labelledby="presence-history-heading" className="mt-12 scroll-mt-20">
      <div className="flex items-baseline gap-3 border-b-2 border-paper pb-2">
        <h2 id="presence-history-heading" className="font-headline text-[1.9rem]">
          Presence history
        </h2>
        <span className="font-label text-[0.85rem] tracking-[0.08em] text-paper-mute">
          {initialMeta ? `${initialMeta.count} in all` : "Newest first"}
        </span>
      </div>
      {error && (
        <p role="alert" className="py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {rows.length === 0 && !error ? (
        <p className="py-4 text-sm text-paper-dim">No presence set yet.</p>
      ) : (
        <ol>
          {rows.map((row, i) => {
            const stamp = isClient ? wireStamp(row.set_at, new Date()) : null;
            return (
              <li
                key={`${row.set_at}-${i}`}
                className="grid grid-cols-[4.2rem_minmax(0,1fr)] gap-3.5 border-b border-rule py-3"
              >
                <time dateTime={row.set_at} className="font-headline text-[1.6rem] leading-[0.9] text-paper-dim">
                  {stamp?.clock ?? "--:--"}
                  <small className="font-label mt-1 block text-[0.7rem] tracking-[0.08em] text-paper-mute">
                    {stamp?.day ?? " "}
                  </small>
                </time>
                <div className="min-w-0">
                  <p className="flex items-baseline justify-between gap-3">
                    <b className="font-semibold break-words">{row.activity_name}</b>
                    {i === 0 && (
                      <span className="font-label shrink-0 text-[0.78rem] tracking-[0.08em] text-paper">Now</span>
                    )}
                  </p>
                  <p className="text-[0.82rem] text-paper-mute">Set by {presenceSetter(row)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {next != null && (
        <Button type="button" variant="outline" size="sm" className="mt-4" disabled={loading} onClick={loadOlder}>
          {loading ? "Loading..." : "Older"}
        </Button>
      )}
    </section>
  );
}
