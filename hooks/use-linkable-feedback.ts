"use client";

import { useEffect, useState } from "react";
import { listLinkableFeedbackAction } from "@/app/actions/roadmap";
import type { RoadmapFeedback } from "@/lib/roadmap/types";

// Every Feedback the item dialog's picker can link, read once when the
// dialog opens (www#233). `all` is null while it loads.
export function useLinkableFeedback() {
  const [all, setAll] = useState<RoadmapFeedback[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    listLinkableFeedbackAction()
      .then((res) => {
        if (!live) return;
        if (res.ok) setAll(res.data);
        else setError(res.error);
      })
      .catch(() => live && setError("Couldn't load the Feedback to link. Close the dialog and try again."));
    return () => {
      live = false;
    };
  }, []);

  return { all, error };
}
