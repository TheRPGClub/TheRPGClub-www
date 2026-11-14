import { apiFetch } from "@/lib/api";
import type { ApiCollection, Platform } from "@/lib/api/types";
import { igdbAddBlockedReason } from "@/lib/igdb";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { CompletionForMemberForm } from "@/components/admin/completion-for-member-form";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("completions");

// Every GameDB platform, by name, for the platform select. Empty when the
// list can't be read (the platform is optional).
async function fetchPlatforms(): Promise<Platform[]> {
  try {
    const res = await apiFetch("/api/v1/platforms?per=500", { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiCollection<Platform>;
    return [...body.data].sort((a, b) => a.platform_name.localeCompare(b.platform_name));
  } catch {
    return [];
  }
}

// /admin/completions: a Superadmin logs a Game Completion for another member,
// as the bot's /game-completion add does for them, with the announce option.
export default async function CompletionForMemberPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const platforms = await fetchPlatforms();
  const actorName = session.principal.global_name ?? session.principal.username;

  return (
    <div>
      <DeskHeader
        title="Game Completion"
        side={
          <>
            <b>For another member</b> · Superadmin
            <br />
            Announced in Whatcha Playing
          </>
        }
      />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">{SECTION.blurb}</p>
      <CompletionForMemberForm
        actorName={actorName}
        platforms={platforms}
        igdbBlockedReason={igdbAddBlockedReason(true, session.membership)}
      />
    </div>
  );
}
