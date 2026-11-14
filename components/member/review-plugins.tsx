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
import { Key, PlateLeaf, toPlatePlugin, type PlateLeafProps } from "platejs/react";

import { BaseSpoilerPlugin } from "@/lib/reviews/spoiler-plugin";
import {
  Blockquote,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Paragraph,
} from "./review-composer/review-elements";
import {
  BulletedList,
  ListItem,
  ListItemContent,
  NumberedList,
} from "./review-composer/review-list-elements";

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
