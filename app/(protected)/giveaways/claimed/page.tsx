import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { fetchClaimedKeys } from "@/lib/api/game-keys";
import { fetchMemberNames } from "@/lib/api/members";
import { platformFamily, shortDate } from "@/lib/giveaways";
import { PageHeader } from "@/components/templates/page-header";
import { GameCover } from "@/components/issue/game-cover";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { ClaimedKeyCell } from "@/components/giveaways/claimed-key-cell";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Your claimed keys" };

// Every key the member has claimed, newest claim first, with the key itself
// (masked until asked), so a claimed key is never lost.
export default async function ClaimedKeysPage() {
  const session = await requireAuth();
  const features = await requireFeature("giveaways");
  const [keys, names] = await Promise.all([
    fetchClaimedKeys(session.principal.discord_id),
    fetchMemberNames(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your claimed keys"
        badge={features.preview("giveaways") && <PreviewBadge />}
        count={keys ? `${keys.length} ${keys.length === 1 ? "key" : "keys"}` : undefined}
        description="Each key you claim stays here. The bot also sent each one to your Discord DMs when you claimed it."
        actions={
          <Link href="/giveaways" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft data-icon="inline-start" />
            Back to the shelf
          </Link>
        }
      />
      {keys === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load your claimed keys. Refresh to try again."}
        </p>
      ) : keys.length === 0 ? (
        <p className="rounded-md border border-dashed border-rule-strong px-5 py-8 text-paper-mute">
          {"You haven't claimed a key yet. "}
          <Link href="/giveaways" className="text-paper underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight">
            See the shelf
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-[0.93rem]">
            <thead>
              <tr className="font-label text-left text-[0.78rem] text-paper-mute">
                <th className="px-2 py-1"><span className="sr-only">Cover</span></th>
                <th className="px-2 py-1">Game</th>
                <th className="px-2 py-1">Platform</th>
                <th className="px-2 py-1">Key</th>
                <th className="px-2 py-1">From</th>
                <th className="px-2 py-1">Claimed</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const title = k.game?.title ?? k.game_title;
                return (
                  <tr key={k.key_id} className="border-b border-rule align-middle">
                    <td className="px-2 py-2.5">
                      <GameCover title="" coverUrl={k.game?.cover_url} className="w-[34px]" />
                    </td>
                    <td className="px-2 py-2.5 font-semibold">
                      {k.game ? (
                        <Link href={`/games/${k.game.game_id}`} className="hover:text-highlight">
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                      {k.region !== "Global" && <span className="ml-2 text-xs text-paper-mute">{k.region}</span>}
                    </td>
                    <td className="px-2 py-2.5">
                      <PlatformChip ink={platformFamily(k.platform).ink}>{k.platform}</PlatformChip>
                    </td>
                    <td className="px-2 py-2.5">
                      <ClaimedKeyCell value={k.key_value} title={title} />
                    </td>
                    <td className="px-2 py-2.5 text-paper-dim">{names.get(k.donor_user_id) ?? "A member"}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-paper-dim">{shortDate(k.claimed_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
