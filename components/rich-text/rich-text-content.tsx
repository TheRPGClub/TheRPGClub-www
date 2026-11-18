import type { AnySlatePlugin, NodeComponents, Value } from "platejs";
import { PlateStatic, createStaticEditor } from "platejs/static";

import { cn } from "@/lib/utils";
import { richTextStaticComponents, richTextStaticPlugins } from "./static-kit";

// Read-only rendering of a rich-text value, on the server.
//
// `platejs/static` carries no "use client" and no React hooks, so the whole
// node tree renders in the RSC pass and a page listing twenty reviews ships
// none of the editor. The one exception is the spoiler mark, which needs a
// click to reveal and so stays a client island.

export interface RichTextContentProps {
  // A value already through `sanitizeRichText` (or a feature's own reader
  // built on it). This renders what it is given.
  value: Value;
  className?: string;
  // `compact` is every place the text is quoted alongside other UI: a card's
  // excerpt, a composer's preview. `article` is the text's own page, set at a
  // reading measure.
  variant?: "compact" | "article";
  // The plugin set, for a feature with extra node types. Defaults to the
  // shared set; spread `richTextStaticPlugins` to add to it.
  plugins?: AnySlatePlugin[];
  // Components for extra node types, merged over the shared ones.
  components?: NodeComponents;
}

export function RichTextContent({
  value,
  className,
  variant = "compact",
  plugins = richTextStaticPlugins,
  components,
}: RichTextContentProps) {
  const article = variant === "article";

  const editor = createStaticEditor({
    plugins,
    components: { ...richTextStaticComponents(article), ...components },
    value,
    // Ids only matter to the editor; skip generating them for a render.
    nodeId: false,
  });

  return (
    <PlateStatic
      editor={editor}
      className={cn(
        // Pasted links and long words break anywhere rather than push a
        // phone-width page sideways.
        "min-w-0 [overflow-wrap:anywhere]",
        article ? "text-base leading-relaxed" : "text-sm leading-relaxed",
        className,
      )}
    />
  );
}
