import { apiFetch } from "@/lib/api";
import type { Roadmap } from "@/lib/roadmap/types";

// Server-only read of the Roadmap (spec api#505; it reads the session
// cookie). Null when it can't be read.
export async function fetchRoadmap(): Promise<Roadmap | null> {
  try {
    const res = await apiFetch("/api/v1/roadmap", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: Roadmap };
    return body.data;
  } catch {
    return null;
  }
}
