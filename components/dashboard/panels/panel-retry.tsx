"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Try again" inside a panel whose source failed: renders the dashboard
// again on the server, so every panel re-reads (the healthy ones from the
// Data Cache).
export function PanelRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="col-start-2 justify-self-start @md:col-start-auto"
    >
      <RotateCcw aria-hidden className={pending ? "motion-safe:animate-spin" : undefined} />
      {pending ? "Trying" : "Try again"}
    </Button>
  );
}
