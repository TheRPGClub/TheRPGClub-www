import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ApiSingle, Game } from "@/lib/api/types";
import { requireAuth } from "@/lib/session";
import { gameEditViewer, parseGameEditTab } from "@/lib/games/game-edit/tabs";
import { GameEditView } from "@/components/games/edit/game-edit-view";

export const metadata = { title: "Edit game" };

// /games/:id/edit (spec api#437): a staff tool, not a Feature. Admins and up
// edit every section; a Regular, or staff below Admin, links Game Threads
// only; anyone else gets a 404. `?tab=` picks the open tab.
export default async function GameEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ id }, query, session] = await Promise.all([params, searchParams, requireAuth()]);
  const gameId = Number(id);
  const viewer = gameEditViewer(session.membership);
  if (!Number.isInteger(gameId) || gameId <= 0 || !viewer) notFound();

  const res = await apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { data: game }: ApiSingle<Game> = await res.json();

  return (
    <GameEditView
      gameId={gameId}
      title={game.title}
      coverUrl={game.cover_url}
      artUrl={game.art_url}
      record={{ text: { description: game.description, featured_video_url: game.featured_video_url } }}
      viewer={viewer}
      tab={parseGameEditTab(query.tab, viewer)}
    />
  );
}
