import { createSlatePlugin } from "platejs";

export const SPOILER_KEY = "spoiler";

/**
 * A mark that hides plot talk until the reader asks for it.
 *
 * Framework-agnostic half, so the static renderer can use it on the server —
 * `SpoilerPlugin` in ../../components/member/review-plugins.ts adds the React
 * component and the keyboard shortcut. Modelled on Plate's own mark plugins:
 * a leaf node with a `toggle` transform, which is what makes
 * `editor.tf.spoiler.toggle()` and `useMarkToolbarButton` work for it.
 *
 * `render.as` is deliberately unset — a spoiler needs a click handler to
 * reveal, so both sides supply a component instead.
 */
export const BaseSpoilerPlugin = createSlatePlugin({
  key: SPOILER_KEY,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ["SPAN"] },
          { validAttribute: { "data-spoiler": "true" } },
        ],
        // Only claim a span that actually carries the marker, otherwise every
        // pasted span becomes a spoiler.
        query: ({ element }) => element.dataset?.spoiler === "true",
      },
    },
  },
}).extendTransforms(({ editor, type }) => ({
  toggle: () => {
    editor.tf.toggleMark(type);
  },
}));
