// An exception to a structure rule is an inline disable comment that says why:
//   // eslint-disable-next-line structure/no-raw-controls -- native file picker
// This rule flags a disable comment naming a structure rule with no "-- reason".
const DIRECTIVE = /^\s*eslint-disable(?:-next-line|-line)?(?=\s|$)(.*)$/s;
const STRUCTURE_RULE = /(?:^|[\s,])(?:structure\/[\w-]+|max-lines)(?=[\s,]|$)/;

const rule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require a reason on comments that disable a structure rule" },
    schema: [],
    messages: {
      reason:
        "Say why this structure rule is disabled: add \"-- <reason>\" after the rule name.",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = DIRECTIVE.exec(comment.value);
          if (!match) continue;
          const [rules, reason] = match[1].split(/\s--\s/);
          if (!STRUCTURE_RULE.test(rules)) continue;
          if (reason && reason.trim()) continue;
          context.report({ loc: comment.loc, messageId: "reason" });
        }
      },
    };
  },
};

export default rule;
