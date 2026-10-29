import type { Platform } from "@/lib/api/types";

// The display fields of a GOTM / NR-GOTM winner's game, flattened for the
// issue's cover pieces (components/issue/cover-story.tsx, nr-feature.tsx).
// Entries carry no title of their own, so the caller names the fallback.
export function gotmCardProps(
  game: {
    title?: string | null;
    cover_url?: string | null;
    art_url?: string | null;
    initial_release_date?: string | null;
    description?: string | null;
    platforms?: Platform[];
  } | null,
  fallbackTitle: string,
) {
  const year = game?.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;

  return {
    title: game?.title ?? fallbackTitle,
    coverUrl: game?.cover_url ?? null,
    artUrl: game?.art_url ?? null,
    year,
    description: game?.description ?? null,
    platforms: game?.platforms,
  };
}
