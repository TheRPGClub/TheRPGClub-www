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
import { KEYS, type AnySlatePlugin, type NodeComponents } from "platejs";

import { BaseSpoilerPlugin, SPOILER_KEY } from "@/lib/rich-text/spoiler-plugin";
import {
  Link,
  SpoilerLeaf,
  makeBlockquote,
  makeHeading,
  makeParagraph,
} from "./static-elements";
import {
  ListItem,
  ListItemContent,
  makeBulletedList,
  makeNumberedList,
} from "./static-lists";

// The read-only half of the shared rich-text set: framework-agnostic halves
// of the same plugins the editor uses (./editor-kit.tsx). Both sides have to
// agree on node types: the editor writes them, the renderer reads them.
// `p` needs no plugin: BaseParagraphPlugin is part of Plate's core set.
//
// A feature with an extra node type (a mention, say) spreads this list and
// adds its own plugin, and passes the component for it to RichTextContent.
export const richTextStaticPlugins: AnySlatePlugin[] = [
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

// The shared node components, in the compact or the article voice.
export function richTextStaticComponents(article: boolean): NodeComponents {
  return {
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
  };
}
