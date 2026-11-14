import { latestBackfillAction } from "@/app/actions/superadmin-tools";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { ImageBackfillDesk } from "@/components/admin/image-backfill-desk";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("images");

// /admin/images: the API's background download of IGDB images for games
// with none stored (the bot's old /superadmin download-missing-images), with
// its progress. Superadmins only.
export default async function ImageBackfillPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const latest = await latestBackfillAction();

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          <>
            <b>From IGDB</b> · cover and art
            <br />
            One run at a time
          </>
        }
      />
      <ImageBackfillDesk
        initialRun={latest.ok ? (latest.run ?? null) : null}
        initialError={latest.ok ? null : (latest.error ?? null)}
      />
    </div>
  );
}
