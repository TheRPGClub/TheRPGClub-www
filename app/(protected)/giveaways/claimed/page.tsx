import { requireAuth, requireFeature } from "@/lib/session";
import { fetchClaimedKeys, fetchDonatedKeys, fetchShelfKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { othersKeys } from "@/lib/giveaways";
import { GiveawaysHeader } from "@/components/giveaways/tabs/giveaways-header";
import { ClaimedView } from "@/components/giveaways/claimed/claimed-view";

export const metadata = { title: "Your claimed keys" };

// The Claimed tab: every key the member has claimed, newest claim first, each
// an envelope; the picked one (?key=) opens as the letter with the key, so a
// claimed key is never lost.
export default async function ClaimedKeysPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const { key } = await searchParams;
  const viewerId = session.principal.discord_id;
  const [keys, shelf, donated, names] = await Promise.all([
    fetchClaimedKeys(viewerId),
    fetchShelfKeys(),
    fetchDonatedKeys(viewerId),
    fetchMemberNames(),
  ]);
  const pickedId = Number(key);

  return (
    <GiveawaysHeader
      active="claimed"
      preview={features.preview("giveaways")}
      counts={{
        shelf: shelf ? othersKeys(shelf, viewerId).length : null,
        claimed: keys?.length ?? null,
        donated: donated?.length ?? null,
      }}
    >
      <ClaimedView
        keys={keys}
        pickedId={Number.isInteger(pickedId) && pickedId > 0 ? pickedId : null}
        names={names}
        viewerName={names.get(viewerId) ?? session.principal.global_name ?? session.principal.username}
      />
    </GiveawaysHeader>
  );
}
