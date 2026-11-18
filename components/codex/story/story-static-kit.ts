import type { AnySlatePlugin } from "platejs";
import { BaseMentionPlugin, BaseStoryImagePlugin } from "@/lib/codex/story-plugins";
import { richTextStaticPlugins } from "@/components/rich-text/static-kit";

// The read-only half: the shared static plugins plus the Codex's mention and
// image nodes.
export const storyStaticPlugins: AnySlatePlugin[] = [...richTextStaticPlugins, BaseMentionPlugin, BaseStoryImagePlugin];
