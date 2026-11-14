// Bans hand-made controls: raw <button>, <input>, <select>, <textarea> and
// <table> outside the shadcn primitives in components/ui.
const PRIMITIVE = {
  button: "Button",
  input: "Input",
  select: "Select",
  textarea: "Textarea",
  table: "Table",
};

const rule = {
  meta: {
    type: "suggestion",
    docs: { description: "Use the shadcn primitive instead of a raw control element" },
    schema: [],
    messages: {
      raw:
        "Raw <{{tag}}> outside the primitives: use the shadcn {{primitive}} from components/ui. " +
        "If it must stay, disable this line with a reason (-- why).",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier") return;
        const primitive = PRIMITIVE[node.name.name];
        if (!primitive) return;
        context.report({ node, messageId: "raw", data: { tag: node.name.name, primitive } });
      },
    };
  },
};

export default rule;
