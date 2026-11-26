import { requireAuth, requireFeature } from "@/lib/session";
import { fetchClaimedKeys, fetchDonatedKeys, fetchShelfKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { donationsInOrder, othersKeys } from "@/lib/giveaways";
import { GiveawaysHeader } from "@/components/giveaways/tabs/giveaways-header";
import { DonatedView } from "@/components/giveaways/donated/donated-view";

export const metadata = { title: "Your donations" };

// The Donated tab: the keys the member gave, waiting ones first, claimed ones
// greyed out at the end.
export default async function DonatedPage() {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const viewerId = session.principal.discord_id;
  const [donated, shelf, claimed, names] = await Promise.all([
    fetchDonatedKeys(viewerId),
    fetchShelfKeys(),
    fetchClaimedKeys(viewerId),
    fetchMemberNames(),
  ]);
  return (
    <GiveawaysHeader
      active="donated"
      preview={features.preview("giveaways")}
      counts={{
        shelf: shelf ? othersKeys(shelf, viewerId).length : null,
        claimed: claimed?.length ?? null,
        donated: donated?.length ?? null,
      }}
    >
      <DonatedView keys={donated && donationsInOrder(donated)} names={Object.fromEntries(names)} />
    </GiveawaysHeader>
  );
}
