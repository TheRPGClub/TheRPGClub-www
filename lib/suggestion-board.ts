import type { Suggestion } from "@/lib/api/types";
import { fetchMemberNames } from "@/lib/api/members";
import { fetchSuggestions } from "@/lib/api/suggestions";

// The Suggestion Board's two tabs: Open (Pending and Approved) and Rejected.
export type BoardTab = "open" | "rejected";

export function boardTab(raw: string | undefined): BoardTab {
  return raw === "rejected" ? "rejected" : "open";
}

export interface BoardData {
  tab: BoardTab;
  // Both tabs' totals for their labels; null when that read failed.
  openTotal: number | undefined;
  rejectedTotal: number | undefined;
  // The shown tab's Suggestions, or null when they couldn't be read.
  rows: Suggestion[] | null;
  // The banner after a submit: only for the viewer's own, still Pending one.
  pinnedIsViewersPending: boolean;
  // Reviewers' names for the Rejected tab's slips.
  reviewers: Map<string, string>;
}

// Reads the shown tab in full and only the other tab's total.
export async function loadBoard(tab: BoardTab, pinned: number, viewerId: string): Promise<BoardData> {
  const [open, rejected] = await Promise.all([
    fetchSuggestions(["pending", "approved"], tab === "open" ? undefined : 1),
    fetchSuggestions(["rejected"], tab === "rejected" ? undefined : 1),
  ]);
  const shown = tab === "open" ? open : rejected;
  const reviewers =
    tab === "rejected" && rejected
      ? await fetchMemberNames(rejected.rows.map((s) => s.reviewed_by))
      : new Map<string, string>();
  return {
    tab,
    openTotal: open?.total,
    rejectedTotal: rejected?.total,
    rows: shown?.rows ?? null,
    pinnedIsViewersPending: !!open?.rows.some(
      (s) => s.suggestion_id === pinned && s.created_by === viewerId && s.status === "pending",
    ),
    reviewers,
  };
}
