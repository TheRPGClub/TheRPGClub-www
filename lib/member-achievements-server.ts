import { apiFetch } from "@/lib/api";
import type { ApiSingle, MemberAchievementSummary } from "@/lib/api/types";

// The member's achievement summary. `none` is the API's 404: no Linked
// Account, or a member who has left. `failed` is anything else going wrong,
// which pages show as an error rather than as "no achievements".
export type SummaryResult =
  | { status: "ok"; summary: MemberAchievementSummary }
  | { status: "none" }
  | { status: "failed" };

export async function fetchAchievementSummary(
  userId: string,
): Promise<SummaryResult> {
  try {
    const res = await apiFetch(
      `/api/v1/users/${encodeURIComponent(userId)}/achievements/summary`,
      { cache: "no-store" },
    );
    if (res.status === 404) return { status: "none" };
    if (!res.ok) return { status: "failed" };
    const body: ApiSingle<MemberAchievementSummary> = await res.json();
    return { status: "ok", summary: body.data };
  } catch {
    return { status: "failed" };
  }
}
