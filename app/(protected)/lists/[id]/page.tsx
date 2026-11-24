import { notFound } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { fetchGameList } from "@/lib/game-lists/api";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ListBoard } from "@/components/game-lists/page/list-board";

// One Game List, with its editor inline for whoever may change it. A list
// the viewer may not read (another member's Private list) is not found.
export default async function GameListPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const features = await requireFeature("game_lists");
  const { id } = await params;
  const list = await fetchGameList(Number.parseInt(id, 10));
  if (!list) notFound();
  return (
    <ListBoard
      key={list.id}
      initial={list}
      isOwner={list.owner?.user_id === session.principal.discord_id}
      now={new Date().toISOString()}
      badge={features.preview("game_lists") && <PreviewBadge />}
    />
  );
}
