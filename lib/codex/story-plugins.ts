import { createSlatePlugin } from "platejs";

import { IMAGE_TYPE, MENTION_TYPE } from "./story-schema";

// The framework-agnostic halves of the Club Codex's two node types, so the
// server renderer reads them; components/codex/story/ adds the editor's
// React halves.

// A member mentioned in the text: an inline void carrying their Discord id.
export const BaseMentionPlugin = createSlatePlugin({
  key: MENTION_TYPE,
  node: { isElement: true, isInline: true, isVoid: true, isMarkableVoid: true },
});

// An image placed between blocks: a block void carrying the image's id, url
// and caption.
export const BaseStoryImagePlugin = createSlatePlugin({
  key: IMAGE_TYPE,
  node: { isElement: true, isVoid: true },
});
