import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { notSavedMessage } from "@/lib/pinned-pages";
import { cn } from "@/lib/utils";

// A failed pin, unpin or move: the list has already sprung back; this notice
// slip says so, with the API's reason when it refused the list, and goes
// after a few seconds or on dismiss. It covers rows rather than pushing
// them: over the foot of the sidebar's content, or, collapsed to the icon
// rail (a save can fail after the member collapsed), beside the rail's foot
// over the page, at the same width.
export function SidebarPinNotice({
  reason,
  railed,
  onDismiss,
}: {
  reason: string | null;
  railed: boolean;
  onDismiss: () => void;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none z-10",
        railed ? "fixed bottom-3 left-[calc(var(--sidebar-width-icon)+0.75rem)] w-[14.5rem]" : "absolute inset-x-3 bottom-3",
      )}
    >
      <NoticeSlip role="alert" title="Not saved" className="pointer-events-auto pr-10">
        {notSavedMessage(reason)}
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
