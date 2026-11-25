import { notFound } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { fetchGameList } from "@/lib/game-lists/api";
import { isModeratorOrAbove } from "@/lib/staff";
import { canStartFromList } from "@/lib/challenges/start-from";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ListBoard } from "@/components/game-lists/page/list-board";

// One Game List, with its editor inline for whoever may change it. A list
// the viewer may not read (another member's Private list) is not found.
// Its owner (staff, for a club list) may start a Challenge from it, unless
// it already feeds one: then the page links that Challenge instead.
export default async function GameListPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const features = await requireFeature("game_lists");
  const { id } = await params;
  const list = await fetchGameList(Number.parseInt(id, 10));
  if (!list) notFound();
  const viewer = { id: session.principal.discord_id, staff: isModeratorOrAbove(session.membership) };
  const challenges = features.canOpen("challenges");
  const canStart = challenges && canStartFromList(list, viewer);
  return (
    <ListBoard
      key={list.id}
      initial={list}
      isOwner={list.owner?.user_id === session.principal.discord_id}
      now={new Date().toISOString()}
      badge={features.preview("game_lists") && <PreviewBadge />}
      startChallengeHref={canStart ? `/challenges/new?list=${list.id}` : null}
      challengeHref={challenges && list.challenge ? `/challenges/${list.challenge.id}` : null}
    />
  );
}
