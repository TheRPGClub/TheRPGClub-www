import type { ReactNode } from "react";
import type { GameRelations } from "@/lib/api/types";
import { fetchGameRelations } from "@/lib/games/game-page";
import { RailFacts } from "@/components/issue/game-rail";

// The rail's facts: the game's IGDB relations (genres, platforms,
// companies...), each left out when empty. Its dates live in the Releases
// section above.
export async function GameDetails({ gameId }: { gameId: number }) {
  const relations = await fetchGameRelations(gameId);
  return <RailFacts facts={relations ? relationFacts(relations) : []} />;
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
