import type { Game } from "@/lib/api/types";
import type { GameEditSection } from "./engine";

// Alternate Versions: the other GameDB games linked to this one as versions
// of the same game. Links and unlinks stage; Save all sends the unlinks, then
// the links (POST and DELETE /games/:id/alternates). The link is symmetric,
// so both games' pages change.

export interface AlternateVersion {
  game_id: number;
  title: string;
  // First release year and first platform, for the row's meta line.
  year: number | null;
  platform: string | null;
  cover_url: string | null;
}

export interface VersionsStage {
  // Games picked to link, in pick order.
  link: AlternateVersion[];
  // Linked versions to unlink, by game id.
  unlink: number[];
}

export type VersionCall =
  | { kind: "alternate.link"; altGameId: number }
  | { kind: "alternate.unlink"; altGameId: number };

export function alternateVersion(game: Game): AlternateVersion {
  return {
    game_id: game.game_id,
    title: game.title,
    year: game.initial_release_date ? new Date(game.initial_release_date).getUTCFullYear() : null,
    platform: game.platforms?.[0]?.platform_name ?? null,
    cover_url: game.cover_url,
  };
}

// The stage's links and unlinks that change the record.
function effective(loaded: AlternateVersion[], staged: VersionsStage) {
  const linked = new Set(loaded.map((v) => v.game_id));
  return {
    unlink: staged.unlink.filter((id) => linked.has(id)),
    link: staged.link.filter((v) => !linked.has(v.game_id)),
  };
}

export const versionsSection: GameEditSection<AlternateVersion[], VersionsStage, VersionCall> = {
  label: "Versions",
  access: "admin",
  changes: (loaded, staged) => {
    const e = effective(loaded, staged);
    return e.unlink.length + e.link.length;
  },
  plan: (loaded, staged) => {
    const e = effective(loaded, staged);
    return [
      ...e.unlink.map((altGameId) => ({ kind: "alternate.unlink" as const, altGameId })),
      ...e.link.map((v) => ({ kind: "alternate.link" as const, altGameId: v.game_id })),
    ];
  },
  apply: (loaded, staged) => {
    const e = effective(loaded, staged);
    return [...loaded.filter((v) => !e.unlink.includes(v.game_id)), ...e.link];
  },
  remaining: (loaded, staged, saved) => {
    const done = (kind: VersionCall["kind"], id: number) => saved.some((c) => c.kind === kind && c.altGameId === id);
    return {
      link: staged.link.filter((v) => !done("alternate.link", v.game_id)),
      unlink: staged.unlink.filter((id) => !done("alternate.unlink", id)),
    };
  },
};
