"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";

// Where the Playtime control's editor and quick Add Playtime open (2D+F): a
// popover under its segment on desktop, a bottom sheet on phones. Both carry
// the Anton title on a paper rule, the game in label caps, a close, and a
// refusal at the foot.
export function PlaytimePanel({
  open,
  onOpenChange,
  trigger,
  title,
  gameTitle,
  width,
  align = "start",
  error,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // The segment that opens it, as a Button element (rendered by the trigger
  // on desktop, pressed to open the sheet on phones).
  trigger: React.ReactElement<{ onClick?: () => void }>;
  title: string;
  gameTitle: string;
  // The popover's width, as a layout class.
  width: string;
  align?: "start" | "end";
  error: string | null;
  children: React.ReactNode;
}) {
  const mobile = useIsMobile();
  const titleId = useId();
  const head = (
    <div className="font-headline mb-3 flex flex-wrap items-baseline gap-2 border-b-2 border-foreground pb-2 text-[1.35rem] leading-none uppercase">
      <h2 id={titleId} className="contents">
        {title}
        <span className="font-label text-[0.74rem] tracking-[0.08em] text-faint-foreground">{gameTitle}</span>
      </h2>
      <span className="ml-auto self-center">
        {mobile ? (
          <SheetClose render={<Button variant="dismiss" size="icon-sm" aria-label="Close" />}>
            <X aria-hidden />
          </SheetClose>
        ) : (
          <Button variant="dismiss" size="icon-sm" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X aria-hidden />
          </Button>
        )}
      </span>
    </div>
  );
  const foot = error && (
    <p role="alert" className="mt-2.5 text-[0.84rem] text-destructive">
      {error}
    </p>
  );

  if (mobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" showCloseButton={false} aria-labelledby={titleId} className="max-h-[92dvh] gap-0 overflow-y-auto px-4 pt-2.5 pb-5">
            <span aria-hidden className="mx-auto mb-3 h-1 w-11 shrink-0 rounded-[2px] bg-border-strong" />
            {head}
            {children}
            {foot}
          </SheetContent>
        </Sheet>
      </>
    );
  }
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align={align} sideOffset={8} aria-labelledby={titleId} className={`${width} max-h-(--available-height) gap-0 overflow-y-auto px-4.5 pt-3.5 pb-4`}>
        {head}
        {children}
        {foot}
      </PopoverContent>
    </Popover>
  );
}
