import { apiFetch } from "@/lib/api";
import type { ApiCollection, LiveEvent } from "./types";

// The newest `per` live events (newest made first), for the Staff desk's
// in-tray and note; null when the list can't be read.
export async function fetchRecentLiveEvents(per: number): Promise<LiveEvent[] | null> {
  try {
    const res = await apiFetch(`/api/v1/live_events?page=1&per=${per}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as ApiCollection<LiveEvent>).data;
  } catch {
    return null;
  }
}
