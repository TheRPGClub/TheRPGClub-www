import type { CodexEntry } from "@/lib/codex/types";
import { spreadLayout, spreadTail, type SpreadBlock } from "@/lib/codex/lore-story";
import { cn } from "@/lib/utils";
import { RichTextContent } from "@/components/rich-text/rich-text-content";
import { storyStaticPlugins } from "@/components/codex/story/story-static-kit";
import { loreStoryComponents } from "./story-elements";
import { TapedPhoto } from "./taped-photo";

// The opening paragraph's jade Anton drop cap, and the jade square after the
// story's last word.
const OPENING =
  "text-[1.1875rem] leading-[1.55] text-foreground sm:text-[1.375rem] [&_p]:first-letter:font-headline [&_p]:first-letter:float-left [&_p]:first-letter:mt-1 [&_p]:first-letter:mr-3 [&_p]:first-letter:text-[4rem] [&_p]:first-letter:leading-[0.8] [&_p]:first-letter:text-codex-lore sm:[&_p]:first-letter:text-[6rem]";
const END_MARK =
  "[&_:is(p,h1,h2,h3,li):last-child]:after:ml-1.5 [&_:is(p,h1,h2,h3,li):last-child]:after:inline-block [&_:is(p,h1,h2,h3,li):last-child]:after:size-3 [&_:is(p,h1,h2,h3,li):last-child]:after:bg-codex-lore [&_:is(p,h1,h2,h3,li):last-child]:after:content-['']";

function blockClass(block: SpreadBlock): string {
  const type = block.node.type;
  return cn(
    "min-w-0 lg:col-start-2 lg:[grid-row:var(--row)]",
    type === "blockquote" ? "mt-8 mb-2 lg:col-end-4" : /^h[1-3]$/.test(type) ? "mt-8.5 mb-1.5" : "mt-4.5",
    block.row === 1 && "mt-0",
    block.opening ? OPENING : "text-[1.0625rem] leading-[1.65] text-dim-foreground sm:text-[1.125rem]",
    "[&_strong]:text-foreground",
    block.last && END_MARK,
  );
}

// The story as 3D sets it: one column at 600px between two 250px margins,
// each block on its own row and each photo taped into a margin beside the
// block it follows, top-aligned (plus its offset) and hanging down past the
// next blocks without pushing them apart; the spread leaves room under the
// story for the last ones. On phones the photos stack under their blocks.
export function LoreSpread({ entry, story }: { entry: CodexEntry; story: readonly unknown[] }) {
  const blocks = spreadLayout(story, entry.images);
  const components = loreStoryComponents(entry.mentions);
  const numbers = new Map(blocks.flatMap((block) => block.photos).map((photo, i) => [photo.id, i + 1]));
  return (
    <div
      style={{ "--rows": blocks.length, "--tail": `${spreadTail(blocks)}px` } as React.CSSProperties}
      className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,600px)_minmax(0,1fr)] lg:[grid-template-rows:repeat(var(--rows),auto)] lg:gap-x-11 lg:pb-(--tail)"
    >
      {blocks.map((block) => (
        <div key={block.row} className="contents" style={{ "--row": block.row } as React.CSSProperties}>
          <RichTextContent
            value={[block.node]}
            plugins={storyStaticPlugins}
            components={components}
            className={blockClass(block)}
          />
          {block.photos.length > 0 && (
            <div
              style={{ "--offset": `${block.offset}px` } as React.CSSProperties}
              className={cn(
                "my-6 flex flex-col items-center gap-6 self-start lg:my-0 lg:h-0 lg:overflow-visible lg:pt-(--offset) lg:[grid-row:var(--row)]",
                block.side === "left" ? "lg:col-start-1 lg:items-end" : "lg:col-start-3 lg:items-start",
              )}
            >
              {block.photos.map((photo) => (
                <TapedPhoto key={photo.id} photo={photo} number={numbers.get(photo.id) ?? 1} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
