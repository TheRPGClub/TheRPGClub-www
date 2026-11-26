import { apiFetch } from "@/lib/api";
import { renamedPanelKey } from "@/lib/dashboard/panels";

// A member's Dashboard Panels (spec api#421, API api#422,
// `GET /users/:id/dashboard_panels`): the panels they show and can see, in
// their order; the catalogue of every panel they can see (club order), each
// marked `new` until they open edit mode; and whether they saved their own.
// Read on the dashboard only, not through the session.

export interface DashboardPanelEntry {
  key: string;
  scope: "club" | "mine";
  new: boolean;
}

export interface DashboardPanelsDoc {
  panels: string[];
  catalogue: DashboardPanelEntry[];
  customised: boolean;
}

// Not cached: the member's own edits must show on the next render.
const FETCH: RequestInit = { cache: "no-store" };

// null when the read failed; the dashboard then shows the club default.
export async function fetchDashboardPanels(userId: string): Promise<DashboardPanelsDoc | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/dashboard_panels`, FETCH);
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Partial<DashboardPanelsDoc> };
    const data = body.data;
    if (!data || !Array.isArray(data.panels)) return null;
    return {
      panels: [
        ...new Set(data.panels.filter((key): key is string => typeof key === "string").map(renamedPanelKey)),
      ],
      catalogue: Array.isArray(data.catalogue)
        ? data.catalogue.map((entry) => ({ ...entry, key: renamedPanelKey(entry.key) }))
        : [],
      customised: data.customised === true,
    };
  } catch {
    return null;
  }
}
