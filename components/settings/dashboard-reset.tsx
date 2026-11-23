"use client";

import { RotateCcw } from "lucide-react";
import { resetDashboardPanelsAction } from "@/app/actions/dashboard-panels";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PreferenceRow } from "@/components/feature/preference-row";

const ID = "dashboard_panels";

// Beside Reset Pinned Pages, for a member whose Dashboard Panels are their
// own (spec api#421, www#145): Reset asks first, then the API drops their
// list and they follow the club's default again. The refreshed page drops
// this row. The default isn't named: the API owns it and may change it.
export function DashboardReset() {
  return (
    <PreferenceRow
      id={ID}
      name="Dashboard"
      badge={null}
      where="Your own panels and order, under the issue. Reset to follow the club's default panels."
      dim={false}
    >
      <ConfirmDialog
        trigger={
          <Button variant="outline" aria-describedby={`pref-${ID}-where`}>
            <RotateCcw aria-hidden />
            Reset
          </Button>
        }
        title="Reset your dashboard?"
        description="Your dashboard goes back to the club's panels, in the club's order, and follows them if the club changes them. Your own list can't be brought back."
        confirmLabel="Reset dashboard"
        pendingLabel="Resetting…"
        confirmIcon={<RotateCcw aria-hidden />}
        cancelLabel="Keep mine"
        onConfirm={async () => {
          const result = await resetDashboardPanelsAction().catch(() => ({ ok: false }));
          return result.ok ? null : "Couldn't reset your dashboard. Try again.";
        }}
      />
    </PreferenceRow>
  );
}
