import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle, Game, Thread } from "@/lib/api/types";
import { requireAuth } from "@/lib/session";
import {
  alternateVersion,
  gameFranchiseRefs,
  SECTION_UNREADABLE,
  type GameEditUnavailable,
} from "@/lib/games/game-edit";
import { fetchSavedHltb } from "@/lib/games/saved-hltb";
import { gameEditViewer, parseGameEditTab } from "@/lib/games/game-edit/tabs";
import { fetchGameRelations, fetchGameReleases } from "@/lib/games/game-page";
import { fetchReleaseOptions } from "@/lib/games/game-edit/release-options";
import { GameEditView } from "@/components/games/edit/game-edit-view";
import { listGameImagesAction } from "@/app/actions/game-images";

export const metadata = { title: "Edit game" };

// /games/:id/edit (spec api#437): a staff tool, not a Feature. Admins and up
// edit every section; a Regular, or staff below Admin, links Game Threads
// and Franchises (api#442); anyone else gets a 404. `?tab=` picks the open
// tab.
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

  const [res, relations, hltb] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    fetchGameRelations(gameId),
    viewer.admin ? fetchSavedHltb(gameId) : null,
  ]);
  if (!res.ok) notFound();
  const { data: game }: ApiSingle<Game> = await res.json();
  const threads = await fetchGameThreads(gameId);
  const images = viewer.admin ? await listGameImagesAction(gameId) : [];
  // Releases are an Admin's section only.
  const [releases, releaseOptions] = viewer.admin
    ? await Promise.all([fetchGameReleases(gameId), fetchReleaseOptions()])
    : [[], { platforms: [], regions: [] }];
  // An Admin's section whose read failed shows as unavailable, rather than
  // empty and editable; the rest of the page still works.
  const failed = {
    images: images === null,
    releases: releases === null || releaseOptions.platforms.length === 0,
    versions: relations === null,
    hltb: hltb === undefined,
  };
  const unavailable: GameEditUnavailable = {
    ...(viewer.admin
      ? Object.fromEntries(Object.entries(failed).flatMap(([key, bad]) => (bad ? [[key, SECTION_UNREADABLE]] : [])))
      : {}),
    ...(relations === null ? { franchises: SECTION_UNREADABLE } : {}),
  };

  return (
    <GameEditView
      gameId={gameId}
      title={game.title}
      coverUrl={game.cover_url}
      releaseYear={game.initial_release_date ? Number(game.initial_release_date.slice(0, 4)) : null}
      artUrl={game.art_url}
      record={{
        text: { description: game.description, featured_video_url: game.featured_video_url },
        images: images ?? [],
        threads,
        releases: releases ?? [],
        versions: (relations?.alternates ?? []).map(alternateVersion),
        hltb: hltb ?? null,
        franchises: gameFranchiseRefs(relations?.franchises ?? [], game.parent_igdb_id ? (game.parent_game_name ?? "A game not in GameDB") : null),
      }}
      series={relations?.collection?.name ?? null}
      unavailable={unavailable}
      releaseOptions={releaseOptions}
      canRefreshReleases={game.igdb_id != null}
      viewer={viewer}
      tab={parseGameEditTab(query.tab, viewer)}
    />
  );
}

// The game's Game Threads. A failed read fails the page (its error
// boundary) rather than showing an empty list to edit against.
async function fetchGameThreads(gameId: number) {
  const res = await apiFetch(`/api/v1/games/${gameId}/threads?per=50`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Game Threads couldn't be loaded (HTTP ${res.status}).`);
  const { data }: ApiCollection<Thread> = await res.json();
  return data.map(({ thread_id, thread_name, jump_url }) => ({ thread_id, thread_name, jump_url }));
}
