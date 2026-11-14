// Feature code passes only layout classes to a shadcn primitive. Background,
// text colour, radius, shadow and border colour belong to the Theme or to a
// named variant on the primitive (api ADR-0008).
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
    },
  },
  create(context) {
    const primitives = new Set();
    const namespaces = new Set();
    return {
      ImportDeclaration(node) {
        if (!PRIMITIVE_SOURCE.test(node.source.value)) return;
        for (const spec of node.specifiers) {
          if (spec.type === "ImportNamespaceSpecifier") namespaces.add(spec.local.name);
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
        const attr = node.attributes.find(
          (a) => a.type === "JSXAttribute" && a.name.name === "className",
        );
        if (!attr) return;
        const looks = classStrings(attr.value)
          .flatMap((s) => s.split(/\s+/))
          .filter((cls) => cls && lookKind(cls));
        if (looks.length === 0) return;
        context.report({
          node: attr,
          messageId: "look",
          data: { name: context.sourceCode.getText(name), classes: [...new Set(looks)].join(", ") },
        });
      },
    };
  },
};

export default rule;
