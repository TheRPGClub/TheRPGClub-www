// Where the Roadmap points members who want something added: the Feedback
// Board (spec api#505, renamed from the Suggestion Board by spec api#498),
// at /feedback under the `feedback` Feature.
import type { FeatureKey } from "@/lib/features";

export const FEEDBACK_BOARD: { href: string; feature: FeatureKey } = {
  href: "/feedback",
  feature: "feedback",
};
