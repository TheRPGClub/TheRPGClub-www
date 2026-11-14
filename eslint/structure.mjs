// Structure rules for spec www#80. They shipped as warnings (www#81) and are
// errors since www#101 (the palette-name ban since the codemod, www#86), so CI
// fails a pull request that breaks one. An exception is an inline disable
// comment with a reason. The agent guide (AGENTS.md) explains them in prose.
import disableNeedsReason from "./rules/disable-needs-reason.mjs";
import noLookClassesOnPrimitives from "./rules/no-look-classes-on-primitives.mjs";
import noPaletteColors from "./rules/no-palette-colors.mjs";
import noRawControls from "./rules/no-raw-controls.mjs";

const structure = {
  meta: { name: "structure" },
  rules: {
    "disable-needs-reason": disableNeedsReason,
    "no-look-classes-on-primitives": noLookClassesOnPrimitives,
    "no-palette-colors": noPaletteColors,
    "no-raw-controls": noRawControls,
  },
};

// Route files and components. Primitives, server actions, hooks and library
// code are exempt from the size limit.
const sizeLimited = ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"];
const sizeExempt = ["components/ui/**", "app/actions/**", "**/*.test.{ts,tsx}"];
const primitives = ["components/ui/**"];

export const structureConfig = [
  {
    name: "structure/plugin",
    plugins: { structure },
    rules: {
      "structure/disable-needs-reason": "error",
    },
  },
  {
    name: "structure/size-limit",
    files: sizeLimited,
    ignores: sizeExempt,
    rules: {
      "max-lines": ["error", { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    name: "structure/feature-code",
    files: ["**/*.{jsx,tsx}"],
    ignores: primitives,
    rules: {
      "structure/no-raw-controls": "error",
      "structure/no-look-classes-on-primitives": "error",
    },
  },
  {
    name: "structure/palette-names",
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/themes/**", "eslint/**"],
    rules: {
      "structure/no-palette-colors": "error",
    },
  },
];
