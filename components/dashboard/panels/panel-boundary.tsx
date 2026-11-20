"use client";

import { unstable_catchError, type ErrorInfo } from "next/error";
import { PanelError } from "./panel-states";

// A panel whose items threw while drawing (an API shape this page didn't
// expect, say) shows its short error with Try again, and the rest of the
// dashboard stays (spec api#421: one failing source stays inside its panel).
// Try again draws this panel's items again on the server.
function PanelFallback({ title }: { title: string }, { unstable_retry }: ErrorInfo) {
  return <PanelError title={title} onRetry={unstable_retry} />;
}

export const PanelBoundary = unstable_catchError(PanelFallback);
