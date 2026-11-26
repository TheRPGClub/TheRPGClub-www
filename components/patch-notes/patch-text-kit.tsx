import { KEYS, type NodeComponents } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";

import { cn } from "@/lib/utils";

// A Patch's text in Patch Notes' own two voices (www#236), over the shared
// read-only kit. The card: Barlow at 15px with section heads in label caps
// and short dash bullets. The page: Barlow at reading size with section
// heads in Anton on a 2px paper rule and square bullets. Never Discord's look.

export type PatchVoice = "card" | "page";

const HEAD: Record<PatchVoice, Record<1 | 2 | 3, string>> = {
  card: {
    1: "font-label mt-3 mb-1.5 text-[0.875rem] font-extrabold tracking-[0.11em] text-foreground",
    2: "font-label mt-3 mb-1 text-[0.8125rem] font-extrabold tracking-[0.11em] text-foreground",
    3: "font-label mt-2 mb-1 text-[0.75rem] font-bold tracking-[0.1em] text-dim-foreground",
  },
  page: {
    1: "font-headline mt-9 mb-3 border-b-2 border-foreground pb-2 text-[1.75rem] leading-none text-foreground",
    2: "font-headline mt-8 mb-2.5 border-b-2 border-foreground pb-[7px] text-[1.375rem] leading-none tracking-[0.02em] text-foreground",
    3: "font-label mt-6 mb-1.5 text-[0.9375rem] font-extrabold tracking-[0.09em] text-foreground",
  },
};

function heading(level: 1 | 2 | 3, voice: PatchVoice) {
  const tag = `h${level}` as const;
  return function PatchHeading(props: SlateElementProps) {
    return (
      <SlateElement {...props} as={tag} className={cn(HEAD[voice][level], "first:mt-0")}>
        {props.children}
      </SlateElement>
    );
  };
}

function paragraph(voice: PatchVoice) {
  return function PatchParagraph(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="p"
        className={cn(
          "whitespace-pre-wrap first:mt-0",
          voice === "card"
            ? "mt-1.5"
            : "mt-[1em] text-[1.0625rem] leading-[1.75] first:text-[1.1875rem] first:leading-[1.6] first:text-foreground",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

// A bullet: a 7 by 2px dash on the card, a 7px square on the page, in dim
// paper, drawn on the list's own items (a numbered list inside keeps its
// numbers); nested lists step in under their item.
const BULLETED: Record<PatchVoice, string> = {
  card: "my-1 [&>li]:relative [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:top-[0.68em] [&>li]:before:left-px [&>li]:before:h-0.5 [&>li]:before:w-[7px] [&>li]:before:bg-faint-foreground [&>li]:before:content-['']",
  page: "my-2 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.72em] [&>li]:before:left-0.5 [&>li]:before:size-[7px] [&>li]:before:rounded-[1px] [&>li]:before:bg-dim-foreground [&>li]:before:content-['']",
};

const NUMBERED: Record<PatchVoice, string> = {
  card: "my-1 ml-5 list-decimal marker:text-faint-foreground",
  page: "my-2 ml-6 list-decimal marker:font-bold marker:text-dim-foreground",
};

function list(kind: "ul" | "ol", voice: PatchVoice) {
  return function PatchList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as={kind}
        className={cn(kind === "ul" ? BULLETED[voice] : NUMBERED[voice], "[&_ol]:my-0.5 [&_ul]:my-0.5")}
      >
        {props.children}
      </SlateElement>
    );
  };
}

function listItem(voice: PatchVoice) {
  return function PatchListItem(props: SlateElementProps) {
    return (
      <SlateElement {...props} as="li" className={voice === "card" ? "my-0.5" : "my-1.5"}>
        {props.children}
      </SlateElement>
    );
  };
}

// The node components a Patch overrides; links, spoilers and list item
// content stay the shared kit's.
export function patchComponents(voice: PatchVoice): NodeComponents {
  return {
    [KEYS.p]: paragraph(voice),
    [KEYS.h1]: heading(1, voice),
    [KEYS.h2]: heading(2, voice),
    [KEYS.h3]: heading(3, voice),
    [KEYS.ulClassic]: list("ul", voice),
    [KEYS.olClassic]: list("ol", voice),
    [KEYS.li]: listItem(voice),
  };
}
