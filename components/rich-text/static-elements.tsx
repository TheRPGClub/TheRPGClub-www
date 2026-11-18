import {
  SlateElement,
  SlateLeaf,
  type SlateElementProps,
  type SlateLeafProps,
} from "platejs/static";

import { cn } from "@/lib/utils";
import { RichTextSpoiler } from "./spoiler";

// The elements a read-only rich-text value renders (RichTextContent in
// rich-text-content.tsx), each in the compact or the article voice:
// paragraphs, headings, pull quotes, links and spoilers. Lists are in
// static-lists.tsx.

// Article typography follows the Monthly Issue: prose in Barlow at a reading
// measure, headings in the condensed label voice, set in caps. The accent no
// longer tints the prose — track colour is reserved for GOTM and NR-GOTM
// marks — so `accent` is accepted for compatibility and otherwise unused.
//
// Paragraphs keep `whitespace-pre-wrap` because a legacy plain-text review is
// normalized into paragraphs that still carry their single newlines (see
// `reviewBodyValue`). Without it, those reviews would reflow.
export function makeParagraph(article: boolean) {
  return function Paragraph(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="p"
        className={cn(
          "mt-[0.85em] whitespace-pre-wrap first:mt-0",
          article && "mt-[1.1em] text-[1.09rem] leading-[1.8] text-foreground/90",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

// Italics are a mark the writer applies themselves (the toolbar's Italic
// button) — a heading doesn't get to assume that voice for them.
export function makeHeading(level: 1 | 2 | 3, article: boolean) {
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
          "font-label leading-[1.1] font-extrabold tracking-[0.02em] text-foreground",
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
export function makeBlockquote(article: boolean) {
  return function Blockquote(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="blockquote"
        className={cn(
          article
            ? "font-headline my-[1.4em] border-y-2 border-foreground py-4 text-[2rem] leading-[1.02] text-foreground [&_p]:m-0 [&_p]:text-[length:inherit] [&_p]:leading-[inherit] [&_p]:text-foreground"
            : "my-2 border-l border-border-strong pl-3 text-faint-foreground italic",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

export function Link(props: SlateElementProps) {
  const url = (props.element as { url?: string }).url;
  // `sanitizeUrl` keeps root-relative links relative, so those point back
  // into this site and stay in the tab.
  const external = !url?.startsWith("/");

  return (
    <SlateElement
      {...props}
      as="a"
      // Link targets come from whoever wrote the text, so an outbound one
      // never carries our referrer and never gets a handle on this window.
      attributes={{
        ...props.attributes,
        href: url,
        ...(external
          ? { target: "_blank", rel: "noopener noreferrer nofollow ugc" }
          : {}),
      }}
      className="underline decoration-faint-foreground/60 underline-offset-2 hover:text-highlight hover:decoration-highlight"
    >
      {props.children}
    </SlateElement>
  );
}

export function SpoilerLeaf(props: SlateLeafProps) {
  return (
    <SlateLeaf {...props}>
      <RichTextSpoiler>{props.children}</RichTextSpoiler>
    </SlateLeaf>
  );
}
