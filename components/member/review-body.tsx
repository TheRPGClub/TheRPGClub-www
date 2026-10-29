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
import type { ReviewAccent } from "@/lib/reviews/accent";
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

// Article typography follows the Monthly Issue: prose in Barlow at a reading
// measure, headings in the condensed label voice, set in caps. The accent no
// longer tints the prose — track colour is reserved for GOTM and NR-GOTM
// marks — so `accent` is accepted for compatibility and otherwise unused.
//
// Paragraphs keep `whitespace-pre-wrap` because a legacy plain-text review is
// normalized into paragraphs that still carry their single newlines — see
// `reviewBodyValue`. Without it, those reviews would reflow.
function makeParagraph(article: boolean) {
  return function Paragraph(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="p"
        className={cn(
          "mt-[0.85em] whitespace-pre-wrap first:mt-0",
          article && "mt-[1.1em] text-[1.09rem] leading-[1.8] text-paper/90",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

// Italics are a mark the writer applies themselves (the toolbar's Italic
// button) — a heading doesn't get to assume that voice for them.
function makeHeading(level: 1 | 2 | 3, article: boolean) {
  const tag = `h${level}` as const;
  const compact = {
    1: "mt-4 mb-1 text-[1.05rem]",
    2: "mt-3 mb-1 text-base",
    3: "mt-3 mb-1 text-[0.95rem]",
  }[level];
  const styled = {
    1: "mt-[1.6em] mb-[0.5em] text-[1.75rem]",
    2: "mt-[1.6em] mb-[0.5em] text-[1.55rem]",
    3: "mt-[1.5em] mb-[0.4em] text-[1.25rem]",
  }[level];

  return function Heading(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as={tag}
        className={cn(
          "font-label leading-[1.1] font-extrabold tracking-[0.02em] text-paper",
          article ? styled : compact,
          "first:mt-0",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

// In an article a blockquote is the writer's own pull quote, set big in the
// headline voice. In a card it stays a quiet indented aside.
function makeBlockquote(article: boolean) {
  return function Blockquote(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="blockquote"
        className={cn(
          article
            ? "font-headline my-[1.4em] border-y-2 border-paper py-4 text-[2rem] leading-[1.02] text-paper [&_p]:m-0 [&_p]:text-[length:inherit] [&_p]:leading-[inherit] [&_p]:text-paper"
            : "my-2 border-l border-rule-strong pl-3 text-paper-mute italic",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function makeBulletedList(article: boolean) {
  return function BulletedList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="ul"
        className={cn(
          "my-2 ml-5 list-disc marker:text-paper-mute [&_ul]:my-0 [&_ul]:list-[circle] [&_ol]:my-0",
          article && "my-[1em] text-[1.09rem] leading-[1.8] text-paper/90",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function makeNumberedList(article: boolean) {
  return function NumberedList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="ol"
        className={cn(
          "my-2 ml-5 list-decimal marker:text-paper-mute [&_ol]:my-0 [&_ol]:list-[lower-alpha] [&_ul]:my-0",
          article && "my-[1em] text-[1.09rem] leading-[1.8] text-paper/90",
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
      className="underline decoration-paper-mute/60 underline-offset-2 hover:text-highlight hover:decoration-highlight"
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
        article ? "text-base leading-relaxed" : "text-sm leading-relaxed",
        className,
      )}
    />
  );
}
