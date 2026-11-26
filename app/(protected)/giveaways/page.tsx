import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { hasMemberRole, isAdminOrAbove } from "@/lib/staff";
import { fetchClaimedKeys, fetchDonatedKeys, fetchShelfKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { buildShelves, platformFamilyByKey } from "@/lib/giveaways";
import { PageHeader } from "@/components/templates/page-header";
import { GiveawayShelf } from "@/components/giveaways/giveaway-shelf";
import { CounterStrip } from "@/components/giveaways/counter-strip";
import { PlatformTabs } from "@/components/giveaways/platform-tabs";

export const metadata = { title: "Giveaways" };

export default async function GiveawaysPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const badge = features.preview("giveaways") && <PreviewBadge />;
  const { platform } = await searchParams;
  const viewerId = session.principal.discord_id;

  const [keys, claimed, donated, names] = await Promise.all([
    fetchShelfKeys(),
    fetchClaimedKeys(viewerId),
    fetchDonatedKeys(viewerId),
    fetchMemberNames(),
  ]);

  const canClaim = hasMemberRole(session.membership);
  const allShelves = buildShelves(keys ?? []);
  const picked = platformFamilyByKey(platform);
  const shelves = picked ? allShelves.filter((s) => s.family.key === picked.key) : allShelves;
  const nameMap = Object.fromEntries(names);
  const total = allShelves.reduce((n, s) => n + s.count, 0);
  const counts = new Map(allShelves.map((s) => [s.family.key, s.count]));

  const header = (
    <>
      <PageHeader
        title="Giveaways"
        badge={badge}
        count={keys === null ? undefined : `${total} ${total === 1 ? "key" : "keys"} wrapped and waiting`}
      />
      {!canClaim && (
        <p className="max-w-[65ch] text-sm text-dim-foreground">
          You can browse and donate, but claiming a key needs the Members role in Discord, as it does in the bot. If you
          have it, sign out and back in to refresh your roles.
        </p>
      )}
      <PlatformTabs picked={picked} total={total} counts={counts} />
    </>
  );

  if (keys === null) {
    return (
      <div className="space-y-5">
        <PageHeader title="Giveaways" badge={badge} />
        <p role="alert" className="text-destructive">
          {"Couldn't load the shelf. Refresh to try again."}
        </p>
      </div>
    );
  }

  return (
    <GiveawayShelf
      boxes={shelves.flatMap((s) => s.boxes)}
      viewerId={viewerId}
      canClaim={canClaim}
      canRevokeAny={isAdminOrAbove(session.membership)}
      names={nameMap}
      emptyCopy={
        picked ? `No ${picked.label} keys on the shelf right now.` : "The shelf is empty right now. Got a spare key? Put it up."
      }
      header={header}
      counter={<CounterStrip claimed={claimed} donated={donated} names={nameMap} />}
    />
  );
}
