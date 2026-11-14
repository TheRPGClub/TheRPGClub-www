// Helpers for reading Tailwind class names out of JSX and sorting the ones
// that set a look (colour, radius, shadow) from the ones that set layout.

// Every string that can end up in a className expression: literals,
// template parts, cn()/clsx() arguments, conditionals, arrays and object keys.
export function classStrings(node) {
  if (!node) return [];
  switch (node.type) {
    case "Literal":
      return typeof node.value === "string" ? [node.value] : [];
    case "TemplateLiteral":
      return [
        ...node.quasis.map((q) => q.value.cooked ?? ""),
        ...node.expressions.flatMap(classStrings),
      ];
    case "JSXExpressionContainer":
      return classStrings(node.expression);
    case "CallExpression":
      return node.arguments.flatMap(classStrings);
    case "ConditionalExpression":
      return [...classStrings(node.consequent), ...classStrings(node.alternate)];
    case "LogicalExpression":
      return [...classStrings(node.left), ...classStrings(node.right)];
    case "ArrayExpression":
      return node.elements.flatMap(classStrings);
    case "ObjectExpression":
      return node.properties.flatMap((p) => (p.type === "Property" ? classStrings(p.key) : []));
    default:
      return [];
  }
}

// "md:hover:!bg-ink/50" -> "bg-ink/50": drop variants, important and negative marks.
export function utility(cls) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) start = i + 1;
  }
  return cls.slice(start).replace(/^!|!$/g, "").replace(/^-/, "");
}

const TEXT_NOT_COLOUR = new Set([
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl",
  "left", "center", "right", "justify", "start", "end",
  "wrap", "nowrap", "balance", "pretty", "ellipsis", "clip",
]);
const BORDER_NOT_COLOUR = new Set(["", "solid", "dashed", "dotted", "double", "hidden", "none"]);
const LENGTH = /^(?:\d|\.\d|\[(?:\d|\.\d|length:|calc\()|\((?:length:))/;

function isTextColour(value) {
  const head = value.split("/")[0];
  return !TEXT_NOT_COLOUR.has(head) && !LENGTH.test(head);
}

function isBorderColour(value) {
  if (/^(?:collapse|separate|spacing)(?:-|$)/.test(value)) return false;
  const rest = value.replace(/^(?:x|y|t|r|b|l|s|e|bs|be)(?:-|$)/, "");
  return !BORDER_NOT_COLOUR.has(rest) && !LENGTH.test(rest);
}

// The kind of look a class sets, or null for a layout class.
export function lookKind(cls) {
  const u = utility(cls);
  if (/^bg-/.test(u)) return "background";
  if (/^rounded(?:-|$)/.test(u)) return "radius";
  if (/^(?:shadow|inset-shadow|drop-shadow|text-shadow|ring|inset-ring)(?:-|$)/.test(u)) return "shadow";
  if (u.startsWith("text-")) return isTextColour(u.slice(5)) ? "text colour" : null;
  if (u.startsWith("border-")) return isBorderColour(u.slice(7)) ? "border colour" : null;
  return null;
}

// The variant prefix of a class: "md:hover:" for "md:hover:bg-ink".
export function variantPrefix(cls) {
  return cls.slice(0, cls.length - utility(cls).length).replace(/!?-?$/, "");
}

const TYPE = /^(?:font-(?:label|headline|display|cond|sans|serif|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|uppercase|lowercase|capitalize|normal-case|tracking-.+|italic|not-italic)$/;
const PAINT = /^(?:fill|stroke|caret|accent|decoration|outline|mix-blend|bg-blend|backdrop)-(.+)$/;
const NOT_PAINT = /^(?:none|hidden|solid|dashed|dotted|double|wavy|auto|\d.*|offset-.+|\[\d.*)$/;

// A class a primitive must leave to the Theme (api ADR-0008): any look class,
// plus type (face, weight, case, tracking) and paint (fills, strokes, caret,
// decoration and outline colours, blends, backdrops). The focus ring and the
// invalid ring stay on the primitive as its shared base.
export function primitiveLook(cls) {
  const u = utility(cls);
  const prefix = variantPrefix(cls);
  if (/^(?:ring|outline)(?:-|$)/.test(u) && /(?:^|:)(?:focus-visible|aria-invalid|dark:aria-invalid):$/.test(prefix)) return false;
  if (lookKind(cls)) return true;
  if (TYPE.test(u)) return true;
  const paint = PAINT.exec(u);
  return Boolean(paint && !NOT_PAINT.test(paint[1]));
}
