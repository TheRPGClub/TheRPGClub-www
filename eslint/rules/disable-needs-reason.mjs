// An exception to any lint rule is an inline disable comment that says why:
//   // eslint-disable-next-line structure/no-raw-controls -- native file picker
// This rule flags a disable comment (for named rules or for all of them) with
// no "-- reason".
const DIRECTIVE = /^\s*eslint-disable(?:-next-line|-line)?(?=\s|$)(.*)$/s;

const rule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require a reason on every comment that disables a lint rule" },
    schema: [],
    messages: {
      reason:
        "Say why this rule is disabled: add \"-- <reason>\" after the rule name.",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = DIRECTIVE.exec(comment.value);
          if (!match) continue;
          const [, reason] = match[1].split(/\s--\s/);
          if (reason && reason.trim()) continue;
          context.report({ loc: comment.loc, messageId: "reason" });
        }
      },
    };
  },
};

export default rule;
