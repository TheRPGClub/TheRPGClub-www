import type { ReactNode } from "react";
import type { GameRelations } from "@/lib/api/types";
import { fetchGameRelations, formatReleaseDate } from "@/lib/games/game-page";
import { RailFacts } from "@/components/issue/game-rail";
import { RefreshReleasesButton } from "@/components/igdb/refresh-releases-button";

// The rail's facts: the release date, then the game's IGDB relations
// (genres, platforms, companies...), each left out when empty. Members can
// refresh the release info when the game has an IGDB link.
export async function GameDetails({
  gameId,
  releaseDate,
  canRefreshReleases,
}: {
  gameId: number;
  releaseDate: string | null;
  canRefreshReleases: boolean;
}) {
  const relations = await fetchGameRelations(gameId);

  const facts: { label: string; value: ReactNode }[] = [];
  if (releaseDate) {
    facts.push({ label: "Released", value: formatReleaseDate(releaseDate, "long") });
  }
  if (relations) facts.push(...relationFacts(relations));

  return (
    <RailFacts facts={facts}>
      {canRefreshReleases && <RefreshReleasesButton gameId={gameId} />}
    </RailFacts>
  );
}

function joinNames(items: { name: string }[]): string | null {
  return items.length ? items.map((i) => i.name).join(", ") : null;
}

function relationFacts(relations: GameRelations): { label: string; value: ReactNode }[] {
  const rows: [string, string | null][] = [
    ["Genres", joinNames(relations.genres)],
    ["Themes", joinNames(relations.themes)],
    ["Game modes", joinNames(relations.modes)],
    ["Perspectives", joinNames(relations.perspectives)],
    [
      "Platforms",
      relations.platforms.length
        ? relations.platforms.map((p) => p.platform_name).join(", ")
        : null,
    ],
    ["Franchises", joinNames(relations.franchises)],
  ];
  const facts: { label: string; value: ReactNode }[] = rows
    .filter((row): row is [string, string] => !!row[1])
    .map(([label, value]) => ({ label, value }));
  if (relations.companies.length > 0) {
    facts.push({
      label: "Companies",
      value: (
        <ul>
          {relations.companies.map((c) => (
            <li key={c.company_id}>
              {c.name}
              {c.role && <small className="text-faint-foreground"> · {c.role}</small>}
            </li>
          ))}
        </ul>
      ),
    });
  }
  return facts;
}
