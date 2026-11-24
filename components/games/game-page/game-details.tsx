import Link from "next/link";
import type { Franchise, GameRelations } from "@/lib/api/types";
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
  ];
  // The Franchises link to their pages and IGDB's collection reads "Series"
  // (plain text: a Series has no page), first, as the design (www#168) has.
  const facts: Fact[] = [];
  if (relations.franchises.length > 0) {
    facts.push({
      label: relations.franchises.length === 1 ? "Franchise" : "Franchises",
      value: <FranchiseLinks franchises={relations.franchises} />,
    });
  }
  if (relations.collection) facts.push({ label: "Series", value: relations.collection.name });
  facts.push(
    ...rows
      .filter((row): row is [string, string] => !!row[1])
      .map(([label, value]) => ({ label, value })),
  );
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

function FranchiseLinks({ franchises }: { franchises: Franchise[] }) {
  return (
    <span>
      {franchises.map((f, i) => (
        <span key={f.franchise_id}>
          {i > 0 && ", "}
          <Link
            href={`/franchises/${f.franchise_id}`}
            className="font-semibold text-foreground underline decoration-gotm decoration-2 underline-offset-3 hover:text-highlight"
          >
            {f.name}
          </Link>
        </span>
      ))}
    </span>
  );
}
