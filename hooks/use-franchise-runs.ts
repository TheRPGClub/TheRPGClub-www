"use client";

import { useEffect, useState } from "react";
import type { FranchisePage } from "@/lib/franchises/types";

export type FranchiseRunRead = { status: "loading" } | { status: "ok"; page: FranchisePage } | { status: "failed" };

const LOADING: FranchiseRunRead = { status: "loading" };

// The Franchise pages behind the context cards (www#208), read from
// `/api/franchises/:id` one by one without holding the tab up. Each id is
// read once per `epoch` (the saved record: a save reads them all again,
// keeping the old page on screen until the new one is in), so moving a
// card between lanes never reads it again. A failed read stays failed.
export function useFranchiseRuns(ids: number[], epoch: string): (id: number) => FranchiseRunRead {
  const [reads, setReads] = useState<Record<number, { epoch: string; read: FranchiseRunRead }>>({});
  const key = [...new Set(ids)].sort((a, b) => a - b).join(",");

  useEffect(() => {
    const wanted = key ? key.split(",").map(Number) : [];
    const controller = new AbortController();
    for (const id of wanted) {
      if (reads[id]?.epoch === epoch) continue;
      fetch(`/api/franchises/${id}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status));
          return ((await res.json()) as { data: FranchisePage }).data;
        })
        .then(
          (page) => setReads((r) => ({ ...r, [id]: { epoch, read: { status: "ok", page } } })),
          (err: Error) => {
            if (err.name === "AbortError") return;
            setReads((r) => ({ ...r, [id]: { epoch, read: { status: "failed" } } }));
          },
        );
    }
    return () => controller.abort();
    // `reads` is left out: a finished read must not start the others again.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads only skips ids already read for this epoch
  }, [key, epoch]);

  return (id) => {
    const r = reads[id];
    if (!r) return LOADING;
    // A stale page stands until the new read lands; a stale failure retries.
    return r.epoch === epoch || r.read.status === "ok" ? r.read : LOADING;
  };
}
