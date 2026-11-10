import { apiFetch } from "@/lib/api";
import { stateCounts, type FeatureFlagEntry } from "@/lib/feature-flags";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/admin/desk/desk-header";
import { FeatureFlagDesk } from "@/components/admin/features/feature-flag-desk";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("features");

// Every Feature with its flag, what it covers and its last change. Null when
// the list can't be read.
async function fetchFeatureFlags(): Promise<FeatureFlagEntry[] | null> {
  try {
    const res = await apiFetch("/api/v1/features", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: FeatureFlagEntry[] };
    return Array.isArray(body.data) ? body.data : null;
  } catch {
    return null;
  }
}

// /admin/features: Admins and Superadmins set each Feature Off, Preview or
// Live. Core Features and Hideable Features are two departments of one table.
export default async function FeaturesDeskPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const entries = await fetchFeatureFlags();
  const counts = entries ? stateCounts(entries) : null;

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          <>
            {counts && (
              <>
                <span className="tabular-nums"><b>{counts.live} Live</b> · {counts.preview} Preview · {counts.off} Off</span>
                <br />
              </>
            )}
            Changes show on the site at once, in the bot within a minute
          </>
        }
      />
      {entries === null ? (
        <p role="alert" className="mt-5 text-destructive">
          {"Couldn't load the Feature Flags. Refresh to try again."}
        </p>
      ) : (
        <FeatureFlagDesk entries={entries} now={new Date().toISOString()} />
      )}
    </div>
  );
}
