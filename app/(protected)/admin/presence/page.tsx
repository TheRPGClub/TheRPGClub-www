import { listPresenceAction } from "@/app/actions/presence";
import { presenceSetter } from "@/lib/presence";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { PresenceForm } from "@/components/admin/presence/presence-form";
import { PresenceHistory } from "@/components/admin/presence/presence-history";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("presence");

// /admin/presence: set what the bot is playing beside a proof of it, over
// the history of every presence with who set it (#history).
export default async function PresencePage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const history = await listPresenceAction(1);
  const rows = history.ok ? (history.data ?? []) : [];
  const current = rows[0] ?? null;

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          current ? (
            <>
              Playing <b>{current.activity_name}</b>
              <br />
              Set by {presenceSetter(current)}
            </>
          ) : (
            <>
              No presence yet
              <br />
              {SECTION.blurb}
            </>
          )
        }
      />
      <PresenceForm current={current} />
      <PresenceHistory
        initial={rows}
        initialMeta={history.meta ?? null}
        initialError={history.ok ? null : (history.error ?? null)}
      />
    </div>
  );
}
