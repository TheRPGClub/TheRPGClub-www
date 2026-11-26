import { requireAuth, requireFeature } from "@/lib/session";
import { hasMemberRole, isAdminOrAbove } from "@/lib/staff";
import { fetchClaimedKeys, fetchDonatedKeys, fetchShelfKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { buildShelves, othersKeys, platformFamilyByKey } from "@/lib/giveaways";
import { GiveawayShelf } from "@/components/giveaways/giveaway-shelf";
import { GiveawaysHeader } from "@/components/giveaways/tabs/giveaways-header";
import { PlatformTabs } from "@/components/giveaways/platform-tabs";

export const metadata = { title: "Giveaways" };

// The Shelf tab: every key up for grabs except the viewer's own donations.
export default async function GiveawaysPage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const { platform } = await searchParams;
  const viewerId = session.principal.discord_id;

  const [keys, claimed, donated, names] = await Promise.all([
    fetchShelfKeys(),
    fetchClaimedKeys(viewerId),
    fetchDonatedKeys(viewerId),
    fetchMemberNames(),
  ]);

  const canClaim = hasMemberRole(session.membership);
  const allShelves = buildShelves(othersKeys(keys ?? [], viewerId));
  const picked = platformFamilyByKey(platform);
  const shelves = picked ? allShelves.filter((s) => s.family.key === picked.key) : allShelves;
  const total = allShelves.reduce((n, s) => n + s.count, 0);
  const counts = new Map(allShelves.map((s) => [s.family.key, s.count]));

  const header = (
    <GiveawaysHeader
      active="shelf"
      preview={features.preview("giveaways")}
      counts={{ shelf: keys === null ? null : total, claimed: claimed?.length ?? null, donated: donated?.length ?? null }}
    >
      <div className="mt-6 space-y-4">
        {!canClaim && (
          <p className="max-w-[65ch] text-sm text-dim-foreground">
            You can browse and donate, but claiming a key needs the Members role in Discord, as it does in the bot. If
            you have it, sign out and back in to refresh your roles.
          </p>
        )}
        {keys === null ? (
          <p role="alert" className="text-destructive">
            {"Couldn't load the shelf. Refresh to try again."}
          </p>
        ) : (
          <PlatformTabs picked={picked} total={total} counts={counts} />
        )}
      </div>
    </GiveawaysHeader>
  );

  if (keys === null) return header;

  return (
    <GiveawayShelf
      boxes={shelves.flatMap((s) => s.boxes)}
      viewerId={viewerId}
      canClaim={canClaim}
      canRevokeAny={isAdminOrAbove(session.membership)}
      names={Object.fromEntries(names)}
      emptyCopy={
        picked
          ? `No ${picked.label} keys from other members right now.`
          : "Nothing from other members on the shelf right now. Got a spare key? Put it up."
      }
      header={header}
    />
  );
}
