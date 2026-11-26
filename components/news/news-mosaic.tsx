import type { CSSProperties } from "react";
import type { NewsItem } from "@/lib/news";
import { packTiles, tileSize, type TilePlace } from "@/lib/news-catchup";
import { NewsTile } from "./news-tile";

// The new News Items as a mosaic in reading order: one column on a phone,
// two from a medium column, six from a wide one (container widths, not the
// viewport). Each tile's place is worked out ahead (packTiles), so the grid
// has no holes and the keyboard runs in the order the eye does. Rows are
// 146px (184px in two columns) and grow when a tile's words need more.

const area = (p: TilePlace) => `${p.row} / ${p.col} / span ${p.h} / span ${p.w}`;

export function NewsMosaic({
  items,
  nameOf,
  now,
  label,
}: {
  items: NewsItem[];
  nameOf: (key: string | null) => string;
  now: Date;
  label: string;
}) {
  if (items.length === 0) return null;
  const sizes = items.map(tileSize);
  const two = packTiles(sizes, 2);
  const six = packTiles(sizes, 6);
  return (
    <div className="@container">
      <ul
        aria-label={label}
        className="grid gap-2.5 @md:auto-rows-[minmax(11.5rem,auto)] @md:grid-cols-2 @3xl:auto-rows-[minmax(9.125rem,auto)] @3xl:grid-cols-6"
      >
        {items.map((item, i) => (
          <li
            key={item.message_id}
            style={{ "--a2": area(two[i]), "--a6": area(six[i]) } as CSSProperties}
            className="min-w-0 @md:[grid-area:var(--a2)] @3xl:[grid-area:var(--a6)] @md:[&>article]:min-h-0"
          >
            <NewsTile item={item} size={sizes[i]} categoryName={nameOf(item.category_key)} now={now} />
          </li>
        ))}
      </ul>
    </div>
  );
}
