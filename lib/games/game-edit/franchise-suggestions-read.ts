import { apiFetch } from "@/lib/api";
import type { ApiCollection } from "@/lib/api/types";
import type { FranchiseSuggestion } from "./franchise-suggestions";

// The game's Franchise suggestions (api#489; Regulars and above). Any
// failure (a 403 below Regular, an API without the endpoint, the server
// unreachable) is no suggestions: the + Add slots keep the plain search.
export async function fetchFranchiseSuggestions(gameId: number): Promise<FranchiseSuggestion[]> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/franchise_suggestions`, { cache: "no-store" });
    if (!res.ok) return [];
    const { data } = (await res.json()) as ApiCollection<FranchiseSuggestion>;
    return Array.isArray(data) ? data.filter((s) => s?.franchise?.franchise_id) : [];
  } catch {
    return [];
  }
}
