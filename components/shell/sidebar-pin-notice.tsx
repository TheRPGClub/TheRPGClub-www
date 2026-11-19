import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { PINS_NOT_SAVED } from "@/lib/pinned-pages";

// A failed pin or unpin: the list has already sprung back; this notice slip
// says so over the foot of the sidebar's content (it covers rows rather than
// pushing them) and goes after a few seconds or on dismiss.
export function SidebarPinNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10">
      <NoticeSlip role="alert" title="Not saved" className="pointer-events-auto pr-10">
        {PINS_NOT_SAVED}. Your sidebar is back as it was.
        <Button
          variant="inverse-ghost"
          size="icon-sm"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="absolute top-2 right-2"
        >
          <X />
        </Button>
      </NoticeSlip>
    </div>
  );
}
