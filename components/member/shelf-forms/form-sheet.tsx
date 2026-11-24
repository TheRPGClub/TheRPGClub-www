"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

// Where a shelf form opens from the game page or a list page: a dialog on
// desktop, a full-height bottom sheet on phones (spec api#451, 2B). The
// form inside carries its own title and close; `labelledBy` names it.
export function FormSheet({
  open,
  onOpenChange,
  labelledBy,
  wide,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelledBy: string;
  // The Game Completion dialog's two columns.
  wide?: boolean;
  children: React.ReactNode;
}) {
  const mobile = useIsMobile();
  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-labelledby={labelledBy}
          className="max-h-dvh gap-0 overflow-y-auto border-t-0 p-0"
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-labelledby={labelledBy}
        className={wide ? "max-w-[54rem] gap-0 p-0 sm:p-0" : "max-w-[33rem] gap-0 p-0 sm:p-0"}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
