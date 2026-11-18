"use client";

import type { AnyPluginConfig } from "platejs";
import { toPlatePlugin, type PlatePlugin } from "platejs/react";
import { BaseMentionPlugin, BaseStoryImagePlugin } from "@/lib/codex/story-plugins";
import { richTextEditorPlugins } from "@/components/rich-text/editor-kit";
import { MentionChip } from "./mention-chip";
import { StoryImageBlock } from "./story-image-block";

// The Club Codex's editor set: the shared rich-text plugins plus mentions,
// and for a Lore Entry's story its placed photos (www#125). The History
// Event desk (www#126) takes `descriptionEditorPlugins`.
export const MentionPlugin = toPlatePlugin(BaseMentionPlugin, { node: { component: MentionChip } });
export const StoryImagePlugin = toPlatePlugin(BaseStoryImagePlugin, { node: { component: StoryImageBlock } });

// Plate types a plugin by its own key; the shared list holds any.
const asAny = (plugin: unknown) => plugin as PlatePlugin<AnyPluginConfig>;

export const descriptionEditorPlugins: PlatePlugin<AnyPluginConfig>[] = [...richTextEditorPlugins, asAny(MentionPlugin)];
export const storyEditorPlugins: PlatePlugin<AnyPluginConfig>[] = [...descriptionEditorPlugins, asAny(StoryImagePlugin)];
