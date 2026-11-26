import { requireAuth, requireFeature } from "@/lib/session";
import { fetchClaimedKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { ClaimedView } from "@/components/giveaways/claimed/claimed-view";

export const metadata = { title: "Your claimed keys" };

// Every key the member has claimed, newest claim first, each an envelope; the
// picked one (?key=) opens as the letter with the key, so a claimed key is
// never lost.
export default async function ClaimedKeysPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const { key } = await searchParams;
  const viewerId = session.principal.discord_id;
  const [keys, names] = await Promise.all([fetchClaimedKeys(viewerId), fetchMemberNames()]);
  const pickedId = Number(key);

  return (
    <ClaimedView
      keys={keys}
      pickedId={Number.isInteger(pickedId) && pickedId > 0 ? pickedId : null}
      names={names}
      viewerName={names.get(viewerId) ?? session.principal.global_name ?? session.principal.username}
      preview={features.preview("giveaways")}
    />
  );
}
