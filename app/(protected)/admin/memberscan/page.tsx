import { apiFetch } from "@/lib/api";
import type { ApiCollection, BotJob } from "@/lib/api/types";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { MemberscanDesk } from "@/components/admin/memberscan-desk";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("memberscan");

// How far back the page looks on the wire for earlier scans, and how many
// it lists. The API has no kind filter, so this reads one wide page; scans
// are rare, so older ones past it are only on the wire.
const LOOKBACK = 100;
const SHOWN = 5;

async function fetchRecentScans(): Promise<BotJob[]> {
  try {
    const res = await apiFetch(`/api/v1/bot_jobs?page=1&per=${LOOKBACK}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiCollection<BotJob>;
    return body.data.filter((j) => j.kind === "memberscan").slice(0, SHOWN);
  } catch {
    return [];
  }
}

// /admin/memberscan: the bot re-reads the server's members, as its
// /superadmin memberscan does, and reports its counts. Superadmins only.
export default async function MemberscanPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const recent = await fetchRecentScans();

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          <>
            <b>Every member</b> · profiles and roles
            <br />
            Counts when done
          </>
        }
      />
      <MemberscanDesk recent={recent} />
    </div>
  );
}
