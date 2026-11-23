import type { GameRelations } from "@/lib/api/types";
import { DetailsList, type Fact } from "@/components/games/game-page/details-list";

// The row's Details: the game's IGDB relations (genres, platforms,
// companies...), each left out when empty. Its dates live in Releases.
export function GameDetails({ relations }: { relations: GameRelations | null }) {
  const facts = relations ? relationFacts(relations) : [];
  if (facts.length === 0) return null;
  return <DetailsList facts={facts} />;
}

function joinNames(items: { name: string }[]): string | null {
  return items.length ? items.map((i) => i.name).join(", ") : null;
}

function relationFacts(relations: GameRelations): Fact[] {
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
  const facts: Fact[] = rows
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
