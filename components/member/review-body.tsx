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

// Paragraphs keep `whitespace-pre-wrap` because a legacy plain-text review is
// normalized into paragraphs that still carry their single newlines — see
// `reviewBodyValue`. Without it, those reviews would reflow.
function Paragraph(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="p"
      // The gap is in `em`, so one declaration gives a card at text-sm its
      // tighter rhythm and the reading page at text-base its looser one.
      className="mt-[0.85em] whitespace-pre-wrap first:mt-0"
    >
      {props.children}
    </SlateElement>
  );
}

function Heading1(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="h1"
      className="mt-5 mb-1.5 text-lg font-semibold first:mt-0"
    >
      {props.children}
    </SlateElement>
  );
}

function Heading2(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="h2"
      className="mt-4 mb-1 text-base font-semibold first:mt-0"
    >
      {props.children}
    </SlateElement>
  );
}

function Heading3(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="h3"
      className="mt-3 mb-1 text-sm font-semibold first:mt-0"
    >
      {props.children}
    </SlateElement>
  );
}

function Blockquote(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="blockquote"
      className="my-2 border-l-2 border-muted-foreground/30 pl-3 text-muted-foreground italic"
    >
      {props.children}
    </SlateElement>
  );
}

function BulletedList(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="ul"
      className="my-2 ml-5 list-disc [&_ul]:my-0 [&_ul]:list-[circle] [&_ol]:my-0"
    >
      {props.children}
    </SlateElement>
  );
}

function NumberedList(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      as="ol"
      className="my-2 ml-5 list-decimal [&_ol]:my-0 [&_ol]:list-[lower-alpha] [&_ul]:my-0"
    >
      {props.children}
    </SlateElement>
  );
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

const staticComponents = {
  [KEYS.p]: Paragraph,
  [KEYS.h1]: Heading1,
  [KEYS.h2]: Heading2,
  [KEYS.h3]: Heading3,
  [KEYS.blockquote]: Blockquote,
  [KEYS.ulClassic]: BulletedList,
  [KEYS.olClassic]: NumberedList,
  [KEYS.li]: ListItem,
  [KEYS.lic]: ListItemContent,
  [KEYS.link]: Link,
  [SPOILER_KEY]: SpoilerLeaf,
};

export interface ReviewBodyContentProps {
  body: ReviewBody;
  className?: string;
}

/**
 * Renders a stored review body — Plate value, legacy string or imported
 * `{summary}` object alike. Returns null when there is nothing to show, so
 * callers keep control of their own "no body" copy.
 */
export function ReviewBodyContent({ body, className }: ReviewBodyContentProps) {
  const value = reviewBodyValue(body);

  const editor = createStaticEditor({
    plugins: staticPlugins,
    components: staticComponents,
    value,
    // Ids only matter to the editor; skip generating them for a render.
    nodeId: false,
  });

  return (
    <PlateStatic
      editor={editor}
      className={cn("text-sm leading-relaxed", className)}
    />
  );
}
