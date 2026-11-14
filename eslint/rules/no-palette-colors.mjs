// The Monthly Issue palette names (ink, paper, rule and their steps) belong to
// that Theme. Everywhere else uses role-based or club-colour tokens.
import { utility } from "./class-names.mjs";

const NAME = "ink(?:-2|-3)?|rule(?:-strong)?|paper(?:-dim|-mute)?";
const COLOUR_UTILITY =
  "bg|text|border(?:-(?:x|y|t|r|b|l|s|e|bs|be))?|ring|ring-offset|inset-ring|outline|divide" +
  "|fill|stroke|from|via|to|decoration|caret|accent|placeholder" +
  "|shadow|inset-shadow|drop-shadow|text-shadow";
const PALETTE_CLASS = new RegExp(`^(?:${COLOUR_UTILITY})-(${NAME})(?:/\\S+)?$`);
const PALETTE_VAR = new RegExp(`--color-(${NAME})(?![\\w-])`, "g");

function paletteNames(text) {
  const names = text.split(/\s+/).flatMap((cls) => {
    const match = PALETTE_CLASS.exec(utility(cls));
    return match ? [match[1]] : [];
  });
  for (const match of text.matchAll(PALETTE_VAR)) names.push(match[1]);
  return names;
}

const rule = {
  meta: {
    type: "suggestion",
    docs: { description: "Keep the Monthly Issue palette names inside the themes" },
    schema: [],
    messages: {
      palette:
        "Monthly Issue palette name outside the themes: {{names}}. " +
        "Use a role-based or club-colour token instead (api ADR-0008).",
    },
  },
  create(context) {
    function check(node, text) {
      const names = paletteNames(text);
      if (names.length === 0) return;
      context.report({ node, messageId: "palette", data: { names: [...new Set(names)].join(", ") } });
    }
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

export default rule;
