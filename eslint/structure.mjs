// Structure rules for spec www#80. They ship as warnings (www#81) and become
// errors in www#101. The agent guide (AGENTS.md) explains them in prose.
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
      "structure/disable-needs-reason": "warn",
    },
  },
  {
    name: "structure/size-limit",
    files: sizeLimited,
    ignores: sizeExempt,
    rules: {
      "max-lines": ["warn", { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    name: "structure/feature-code",
    files: ["**/*.{jsx,tsx}"],
    ignores: primitives,
    rules: {
      "structure/no-raw-controls": "warn",
      "structure/no-look-classes-on-primitives": "warn",
    },
  },
  {
    name: "structure/palette-names",
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/themes/**", "eslint/**"],
    rules: {
      "structure/no-palette-colors": "warn",
    },
  },
];
