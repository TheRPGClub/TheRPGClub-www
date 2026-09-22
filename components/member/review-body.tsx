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
import {
  PlateStatic,
  SlateElement,
  SlateLeaf,
  createStaticEditor,
  type SlateElementProps,
  type SlateLeafProps,
} from "platejs/static";

import { reviewBodyValue } from "@/lib/api/review-body";
import type { ReviewBody } from "@/lib/api/types";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { BaseSpoilerPlugin, SPOILER_KEY } from "@/lib/reviews/spoiler-plugin";
import { cn } from "@/lib/utils";
import { ReviewSpoiler } from "./review-spoiler";

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

// The literal `first-letter:`/`marker:` classes a drop cap and a list marker
// need, per accent. Tailwind finds utilities by scanning source text for
// whole class strings — a template built from `style.readout` at render time
// wouldn't be in that text, so each one is spelled out here instead.
const DROP_CAP: Record<ReviewAccent, string> = {
  brand: "first-letter:text-brand-200",
  purple: "first-letter:text-purple-200",
  neutral: "first-letter:text-foreground",
};

const LIST_MARKER: Record<ReviewAccent, string> = {
  brand: "marker:text-brand-300",
  purple: "marker:text-purple-300",
  neutral: "marker:text-muted-foreground",
};

// Paragraphs keep `whitespace-pre-wrap` because a legacy plain-text review is
// normalized into paragraphs that still carry their single newlines — see
// `reviewBodyValue`. Without it, those reviews would reflow.
//
// `article` is the review's own page: a looser line-height meant for a
// sitting, and its opening paragraph — path `[0]`, the static renderer
// always supplies one — gets a drop cap. The numbers end at the scorecard
// above it, and this is where the writing actually starts.
function makeParagraph(article: boolean, accent: ReviewAccent) {
  return function Paragraph(props: SlateElementProps) {
    const isOpening =
      article && props.path?.length === 1 && props.path[0] === 0;

    return (
      <SlateElement
        {...props}
        as="p"
        className={cn(
          "mt-[0.85em] whitespace-pre-wrap first:mt-0",
          article && "text-[1.0625rem] leading-[1.8]",
          isOpening && [
            "first-letter:float-left first-letter:mt-1 first-letter:mr-2.5 first-letter:text-[3.75rem] first-letter:leading-[0.8] first-letter:font-bold",
            DROP_CAP[accent],
          ],
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

// Italics are a mark the writer applies themselves (the toolbar's Italic
// button) — a heading doesn't get to assume that voice for them. What a
// heading gets automatically is the review's own hue: the same accent its
// score and scorecard already wear.
function makeHeading(level: 1 | 2 | 3, article: boolean, accent: ReviewAccent) {
  const tag = `h${level}` as const;
  const compact = {
    1: "mt-5 mb-1.5 text-lg font-semibold",
    2: "mt-4 mb-1 text-base font-semibold",
    3: "mt-3 mb-1 text-sm font-semibold",
  }[level];
  const styled = {
    1: "mt-9 mb-2 text-[1.75rem] leading-tight font-semibold",
    2: "mt-7 mb-1.5 text-xl leading-snug font-semibold",
    3: "mt-6 mb-1 text-lg leading-snug font-semibold",
  }[level];
  const style = reviewAccents[accent];

  return function Heading(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as={tag}
        className={cn(
          article ? [styled, style.readout] : compact,
          "first:mt-0",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function makeBlockquote(article: boolean, accent: ReviewAccent) {
  return function Blockquote(props: SlateElementProps) {
    const style = reviewAccents[accent];
    return (
      <SlateElement
        {...props}
        as="blockquote"
        className={cn(
          "border-l-2",
          article
            ? ["my-6 pl-5 text-xl leading-snug italic", style.quote]
            : "my-2 border-muted-foreground/30 pl-3 text-muted-foreground italic",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function makeBulletedList(article: boolean, accent: ReviewAccent) {
  return function BulletedList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="ul"
        className={cn(
          "my-2 ml-5 list-disc [&_ul]:my-0 [&_ul]:list-[circle] [&_ol]:my-0",
          article && LIST_MARKER[accent],
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function makeNumberedList(article: boolean, accent: ReviewAccent) {
  return function NumberedList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="ol"
        className={cn(
          "my-2 ml-5 list-decimal [&_ol]:my-0 [&_ol]:list-[lower-alpha] [&_ul]:my-0",
          article && LIST_MARKER[accent],
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function ListItem(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="li" className="my-0.5">
      {props.children}
    </SlateElement>
  );
}

// List item content is the text row of an `li`. It has to stay inline or the
// marker sits on its own line.
function ListItemContent(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="span" className="whitespace-pre-wrap">
      {props.children}
    </SlateElement>
  );
}

function Link(props: SlateElementProps) {
  const url = (props.element as { url?: string }).url;
  // `sanitizeReviewValue` keeps root-relative links relative, so those point
  // back into this site and stay in the tab.
  const external = !url?.startsWith("/");

  return (
    <SlateElement
      {...props}
      as="a"
      // Link targets come from whoever wrote the review, so an outbound one
      // never carries our referrer and never gets a handle on this window.
      attributes={{
        ...props.attributes,
        href: url,
        ...(external
          ? { target: "_blank", rel: "noopener noreferrer nofollow ugc" }
          : {}),
      }}
      className="underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
    >
      {props.children}
    </SlateElement>
  );
}

function SpoilerLeaf(props: SlateLeafProps) {
  return (
    <SlateLeaf {...props}>
      <ReviewSpoiler>{props.children}</ReviewSpoiler>
    </SlateLeaf>
  );
}

export interface ReviewBodyContentProps {
  body: ReviewBody;
  className?: string;
  // `compact` is every place a review is quoted alongside other UI: the
  // listing card's excerpt, the composer's own preview. `article` is the
  // review's own page — the one place its writing gets to look like writing,
  // in the serif and at the measure the rest of the site never uses.
  variant?: "compact" | "article";
  // Only read in `article` variant, for the drop cap and pull-quotes.
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
  accent = "neutral",
}: ReviewBodyContentProps) {
  const value = reviewBodyValue(body);
  const article = variant === "article";

  const editor = createStaticEditor({
    plugins: staticPlugins,
    components: {
      [KEYS.p]: makeParagraph(article, accent),
      [KEYS.h1]: makeHeading(1, article, accent),
      [KEYS.h2]: makeHeading(2, article, accent),
      [KEYS.h3]: makeHeading(3, article, accent),
      [KEYS.blockquote]: makeBlockquote(article, accent),
      [KEYS.ulClassic]: makeBulletedList(article, accent),
      [KEYS.olClassic]: makeNumberedList(article, accent),
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
        article ? "text-base leading-relaxed" : "text-sm leading-relaxed",
        className,
      )}
    />
  );
}
