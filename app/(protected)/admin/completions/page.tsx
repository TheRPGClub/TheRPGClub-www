import type { Platform } from "@/lib/api/types";
import { igdbAddBlockedReason } from "@/lib/igdb";
import { requireAuth } from "@/lib/session";
import { canUseTier, STAFF_DESK_BACK, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { CompletionForMemberForm } from "@/components/admin/completions/completion-for-member-form";
import { StaffOnly } from "@/components/staff-only";
import { fetchPlatforms } from "@/lib/api/shared";

const SECTION = staffSection("completions");

// Every GameDB platform, by name, for the platform select. Empty when the
// list can't be read (the platform is optional).
async function platformsByName(): Promise<Platform[]> {
  return [...((await fetchPlatforms()) ?? [])].sort((a, b) => a.platform_name.localeCompare(b.platform_name));
}

// /admin/completions: a Superadmin logs a Game Completion for another member,
// as the bot's /game-completion add does for them, with the announce option.
export default async function CompletionForMemberPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const platforms = await platformsByName();
  const actorName = session.principal.global_name ?? session.principal.username;

  return (
    <div>
      <DeskHeader
        back={STAFF_DESK_BACK}
        title="Game Completion"
        side={
          <>
            <b>For another member</b> · Superadmin
            <br />
            Announced in Whatcha Playing
          </>
        }
      />
      <div data-slot="desk-body">
        <p className="mt-3 max-w-[60ch] text-dim-foreground">{SECTION.blurb}</p>
        <CompletionForMemberForm
          actorName={actorName}
          platforms={platforms}
          igdbBlockedReason={igdbAddBlockedReason(true, session.membership)}
        />
      </div>
    </div>
  );
}
