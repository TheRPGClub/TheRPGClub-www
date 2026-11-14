// Feature code passes only layout classes to a shadcn primitive. Background,
// text colour, radius, shadow (rings included) and border colour belong to
// the Theme or to a named variant on the primitive (api ADR-0008). That holds
// for every class prop a primitive takes (className, indicatorClassName...).
// A primitive's variant helper (buttonVariants) is flagged outside the
// primitives: on another element it carries no data-slot, so no Theme can
// reach it; render the primitive (ButtonLink for a link) instead.
import { classStrings, lookKind } from "./class-names.mjs";

const PRIMITIVE_SOURCE = /^(?:@\/components\/ui\/|(?:\.{1,2}\/)+(?:.*\/)?ui\/)/;

const rule = {
  meta: {
    type: "suggestion",
    docs: { description: "Pass only layout classes to shadcn primitives" },
    schema: [],
    messages: {
      look:
        "Look classes on <{{name}}>: {{classes}}. Pass only layout classes to a primitive; " +
        "make a different look a named variant (api ADR-0008).",
      helper:
        "{{name}}() styles an element no Theme can reach (no data-slot). Render the primitive " +
        "instead (a link that looks like a button is <ButtonLink>; api ADR-0008).",
    },
  },
  create(context) {
    const primitives = new Set();
    const namespaces = new Set();
    const helpers = new Set();
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !helpers.has(node.callee.name)) return;
        context.report({ node, messageId: "helper", data: { name: node.callee.name } });
      },
      ImportDeclaration(node) {
        if (!PRIMITIVE_SOURCE.test(node.source.value)) return;
        for (const spec of node.specifiers) {
          if (spec.type === "ImportNamespaceSpecifier") namespaces.add(spec.local.name);
          else if (/Variants$/.test(spec.local.name)) helpers.add(spec.local.name);
          else primitives.add(spec.local.name);
        }
      },
      JSXOpeningElement(node) {
        const { name } = node;
        const isPrimitive =
          (name.type === "JSXIdentifier" && primitives.has(name.name)) ||
          (name.type === "JSXMemberExpression" &&
            name.object.type === "JSXIdentifier" &&
            namespaces.has(name.object.name));
        if (!isPrimitive) return;
        const attrs = node.attributes.filter(
          (a) => a.type === "JSXAttribute" && /^(?:className|[a-z]\w*ClassName)$/.test(a.name.name),
        );
        for (const attr of attrs) {
          const looks = classStrings(attr.value)
            .flatMap((s) => s.split(/\s+/))
            .filter((cls) => cls && lookKind(cls));
          if (looks.length === 0) continue;
          context.report({
            node: attr,
            messageId: "look",
            data: { name: context.sourceCode.getText(name), classes: [...new Set(looks)].join(", ") },
          });
        }
      },
    };
  },
};

export default rule;
