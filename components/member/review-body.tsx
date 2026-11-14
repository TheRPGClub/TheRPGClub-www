import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
} from "@platejs/basic-nodes";
import { BaseLinkPlugin } from "@platejs/link";
import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from "@platejs/list-classic";
import { KEYS } from "platejs";
import { PlateStatic, createStaticEditor } from "platejs/static";

import { reviewBodyValue } from "@/lib/api/review-body";
import type { ReviewBody } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { BaseSpoilerPlugin, SPOILER_KEY } from "@/lib/reviews/spoiler-plugin";
import { cn } from "@/lib/utils";
import {
  Link,
  SpoilerLeaf,
  makeBlockquote,
  makeHeading,
  makeParagraph,
} from "./review-body-elements";
import {
  ListItem,
  ListItemContent,
  makeBulletedList,
  makeNumberedList,
} from "./review-body-lists";

// Read-only rendering of a review body, on the server.
//
// `platejs/static` carries no "use client" and no React hooks, so the whole
// node tree renders in the RSC pass and a page listing twenty reviews ships
// none of the editor. The one exception is the spoiler mark, which needs a
// click to reveal and so stays a client island.

// Framework-agnostic halves of the same plugins the editor uses. Both sides
// have to agree on node types — the editor writes them, this reads them.
// `p` needs no plugin: BaseParagraphPlugin is part of Plate's core set.
const staticPlugins = [
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSpoilerPlugin,
  BaseLinkPlugin,
  BaseListPlugin,
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,
];

export interface ReviewBodyContentProps {
  body: ReviewBody;
  className?: string;
  // `compact` is every place a review is quoted alongside other UI: the
  // listing card's excerpt, the composer's own preview. `article` is the
  // review's own page and the reviews list's reader, set at a reading measure.
  variant?: "compact" | "article";
  // Kept for callers that still pass it; the article no longer tints by track.
  accent?: ReviewAccent;
}

/**
 * Renders a stored review body — Plate value, legacy string or imported
 * `{summary}` object alike. Returns null when there is nothing to show, so
 * callers keep control of their own "no body" copy.
 */
export function ReviewBodyContent({
  body,
  className,
  variant = "compact",
}: ReviewBodyContentProps) {
  const value = reviewBodyValue(body);
  const article = variant === "article";

  const editor = createStaticEditor({
    plugins: staticPlugins,
    components: {
      [KEYS.p]: makeParagraph(article),
      [KEYS.h1]: makeHeading(1, article),
      [KEYS.h2]: makeHeading(2, article),
      [KEYS.h3]: makeHeading(3, article),
      [KEYS.blockquote]: makeBlockquote(article),
      [KEYS.ulClassic]: makeBulletedList(article),
      [KEYS.olClassic]: makeNumberedList(article),
      [KEYS.li]: ListItem,
      [KEYS.lic]: ListItemContent,
      [KEYS.link]: Link,
      [SPOILER_KEY]: SpoilerLeaf,
    },
    value,
    // Ids only matter to the editor; skip generating them for a render.
    nodeId: false,
  });

  return (
    <PlateStatic
      editor={editor}
      className={cn(
        // Pasted links and long words break anywhere rather than push a
        // phone-width page sideways.
        "min-w-0 [overflow-wrap:anywhere]",
        article ? "text-base leading-relaxed" : "text-sm leading-relaxed",
        className,
      )}
    />
  );
}
