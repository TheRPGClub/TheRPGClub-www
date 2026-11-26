// Where the Roadmap points members who want something added: the Feedback
// Board (spec api#505). Until the Suggestion Board's rename to the Feedback
// Board (spec api#498) lands, the board lives at /suggestions under the
// `suggestions` Feature; that change updates only this file.
import type { FeatureKey } from "@/lib/features";

export const FEEDBACK_BOARD: { href: string; feature: FeatureKey } = {
  href: "/suggestions",
  feature: "suggestions",
};
