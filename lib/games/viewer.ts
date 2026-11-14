export interface ViewerOnGame {
  // The viewer's Discord id, or null when signed out.
  ownerId: string | null;
  isPlaying: boolean;
  hasCompleted: boolean;
  // "Write review" unlocks once the viewer has at least started playing the
  // game (now playing) or already finished it (completions).
  canWriteReview: boolean;
  // Where the viewer stands, for the write-a-review panel's line.
  status: "playing" | "completed" | null;
}

// Where the viewer stands with a game: the game page and its reviews page both
// gate the composer on it.
export function viewerOnGame(
  game: { now_playing?: { user_id: string }[]; completions?: { user_id: string }[] },
  ownerId: string | null,
): ViewerOnGame {
  const isPlaying = !!ownerId && (game.now_playing ?? []).some((e) => e.user_id === ownerId);
  const hasCompleted = !!ownerId && (game.completions ?? []).some((e) => e.user_id === ownerId);
  return {
    ownerId,
    isPlaying,
    hasCompleted,
    canWriteReview: isPlaying || hasCompleted,
    status: isPlaying ? "playing" : hasCompleted ? "completed" : null,
  };
}
