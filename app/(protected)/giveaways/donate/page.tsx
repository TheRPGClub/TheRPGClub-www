import { requireAuth, requireFeature } from "@/lib/session";
import { fetchDonatedKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { DonateView } from "@/components/giveaways/donate-view";

export const metadata = { title: "Donate a key" };

// Donate a key, and manage the keys you've donated.
export default async function DonatePage() {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const [keys, names] = await Promise.all([
    fetchDonatedKeys(session.principal.discord_id),
    fetchMemberNames(),
  ]);
  const viewerId = session.principal.discord_id;
  return (
    <DonateView
      preview={features.preview("giveaways")}
      keys={keys}
      names={names}
      donorName={names.get(viewerId) ?? session.principal.global_name ?? session.principal.username}
    />
  );
}
