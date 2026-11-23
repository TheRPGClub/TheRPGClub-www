"use client";

import { RotateCcw } from "lucide-react";
import { resetPinnedPagesAction } from "@/app/actions/pinned-pages";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PreferenceRow } from "@/components/feature/preference-row";

const ID = "pinned_pages";

// The Your layout tab's Pinned Pages row (ticket api#419), in the switches'
// style. For a member whose Pinned Pages are their own it offers Reset,
// which asks first; once reset, the session says the member follows the club
// default, so the refreshed row reads "Following the club's" with no Reset
// and the sidebar shows the default. `names` are the club default's pages,
// as the session gives them.
export function PinnedPagesReset({ names, customised }: { names: string; customised: boolean }) {
  if (!customised) {
    return (
      <PreferenceRow id={ID} name="Pinned Pages" badge={null} where={`Following the club's: ${names}. Use Pin to sidebar on a page to make the list your own.`} dim={false}>
        {null}
      </PreferenceRow>
    );
  }
  return (
    <PreferenceRow
      id={ID}
      name="Pinned Pages"
      badge={null}
      where={`Your own list, top of your sidebar. Reset to follow the club's: ${names}.`}
      dim={false}
    >
      <ConfirmDialog
        trigger={
          <Button variant="outline" aria-describedby={`pref-${ID}-where`}>
            <RotateCcw aria-hidden />
            Reset
          </Button>
        }
        title="Reset your Pinned Pages?"
        description={`Your sidebar goes back to the club's Pinned Pages (${names}) and follows them if the club changes them. Your own list can't be brought back.`}
        confirmLabel="Reset Pinned Pages"
        pendingLabel="Resetting…"
        confirmIcon={<RotateCcw aria-hidden />}
        cancelLabel="Keep mine"
        onConfirm={async () => {
          const result = await resetPinnedPagesAction();
          return result.ok ? null : "Couldn't reset your Pinned Pages. Try again.";
        }}
      />
    </PreferenceRow>
  );
}
