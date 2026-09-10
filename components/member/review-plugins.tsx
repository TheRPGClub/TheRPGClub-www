"use client";

// The `*Rules` input-rule definitions live in the framework-agnostic
// packages; only the plugins themselves have `/react` builds.
import {
  BlockquoteRules,
  BoldRules,
  HeadingRules,
  ItalicRules,
  StrikethroughRules,
} from "@platejs/basic-nodes";
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from "@platejs/basic-nodes/react";
import { LinkPlugin } from "@platejs/link/react";
import { BulletedListRules, OrderedListRules } from "@platejs/list-classic";
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from "@platejs/list-classic/react";
import {
  Key,
  PlateElement,
  PlateLeaf,
  toPlatePlugin,
  type PlateElementProps,
  type PlateLeafProps,
} from "platejs/react";

import { BaseSpoilerPlugin } from "@/lib/reviews/spoiler-plugin";

// The editing half of the review schema. Node types here must match
// ./review-body.tsx, which reads back what this writes.

/**
 * Spoilers stay legible while editing — you cannot write what you cannot see.
 * A dashed underline and a tinted ground mark the range instead; the blur only
 * applies to readers, in ./review-spoiler.tsx.
 */
function SpoilerLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf
      {...props}
      as="span"
      className="rounded-sm bg-foreground/10 decoration-dotted underline decoration-foreground/40 underline-offset-2"
    >
      {props.children}
    </PlateLeaf>
  );
}

const SpoilerPlugin = toPlatePlugin(BaseSpoilerPlugin, {
  node: { component: SpoilerLeaf },
  shortcuts: { toggle: { keys: [[Key.Mod, Key.Shift, "s"]] } },
});

function Paragraph(props: PlateElementProps) {
  return (
    // Matches the published paragraph rhythm, so what you write looks like
    // what everyone else reads.
    <PlateElement {...props} as="p" className="mt-[0.85em] first:mt-0">
      {props.children}
    </PlateElement>
  );
}

function Heading1(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="h1"
      className="mt-5 mb-1.5 text-lg font-semibold first:mt-0"
    >
      {props.children}
    </PlateElement>
  );
}

function Heading2(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="h2"
      className="mt-4 mb-1 text-base font-semibold first:mt-0"
    >
      {props.children}
    </PlateElement>
  );
}

function Heading3(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="h3"
      className="mt-3 mb-1 text-sm font-semibold first:mt-0"
    >
      {props.children}
    </PlateElement>
  );
}

function Blockquote(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="blockquote"
      className="my-2 border-l-2 border-muted-foreground/30 pl-3 text-muted-foreground italic"
    >
      {props.children}
    </PlateElement>
  );
}

function BulletedList(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="ul"
      className="my-2 ml-5 list-disc [&_ul]:my-0 [&_ul]:list-[circle] [&_ol]:my-0"
    >
      {props.children}
    </PlateElement>
  );
}

function NumberedList(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="ol"
      className="my-2 ml-5 list-decimal [&_ol]:my-0 [&_ol]:list-[lower-alpha] [&_ul]:my-0"
    >
      {props.children}
    </PlateElement>
  );
}

function ListItem(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="li" className="my-0.5">
      {props.children}
    </PlateElement>
  );
}

function ListItemContent(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="span">
      {props.children}
    </PlateElement>
  );
}

function Link(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="a"
      className="underline decoration-muted-foreground/50 underline-offset-2"
    >
      {props.children}
    </PlateElement>
  );
}

// Markdown-style shortcuts while typing (`**bold**`, `## `, `- `, `> `).
// Plate ships the rules but wires none of them by default, so each plugin
// opts in.
export const reviewPlugins = [
  H1Plugin.withComponent(Heading1),
  H2Plugin.withComponent(Heading2).configure({
    inputRules: [HeadingRules.markdown()],
  }),
  H3Plugin.withComponent(Heading3),
  BlockquotePlugin.withComponent(Blockquote).configure({
    inputRules: [BlockquoteRules.markdown()],
  }),
  BoldPlugin.configure({ inputRules: [BoldRules.markdown()] }),
  ItalicPlugin.configure({ inputRules: [ItalicRules.markdown()] }),
  StrikethroughPlugin.configure({
    inputRules: [StrikethroughRules.markdown()],
  }),
  SpoilerPlugin,
  LinkPlugin.withComponent(Link),
  ListPlugin,
  BulletedListPlugin.withComponent(BulletedList).configure({
    inputRules: [BulletedListRules.markdown()],
  }),
  NumberedListPlugin.withComponent(NumberedList).configure({
    inputRules: [OrderedListRules.markdown()],
  }),
  ListItemPlugin.withComponent(ListItem),
  ListItemContentPlugin.withComponent(ListItemContent),
];

export const reviewComponents = { p: Paragraph };
