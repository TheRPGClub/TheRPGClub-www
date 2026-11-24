"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Keyboard, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ShelfRow, ShelfStep } from "@/lib/games/shelf";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { SHELF_ICONS, ShelfRowContent, shelfRowLabel } from "./shelf-row";

export interface ShelfSplitButtonProps {
  step: ShelfStep;
  rows: ShelfRow[];
  gameTitle: string;
  // The foot's link to the member's own list page.
  listLink: { href: string; label: string };
  onPick: (row: Pick<ShelfRow, "list" | "mode">) => void;
}

// The game page's split button (spec api#451, 1A): the next step on its
// yellow main side, and a caret opening "Your lists" (a menu under it on
// desktop, a bottom sheet on phones), where it fills the row's width.
export function ShelfSplitButton({ step, rows, gameTitle, listLink, onPick }: ShelfSplitButtonProps) {
  const mobile = useIsMobile();
  const group = useRef<HTMLDivElement>(null);
  const sheetTitle = useId();
  const [sheetOpen, setSheetOpen] = useState(false);
  const Icon = SHELF_ICONS[step.list];
  const head = (
    <>
      Your lists
      <span className="font-label text-[0.74rem] tracking-[0.08em] text-faint-foreground">{gameTitle}</span>
    </>
  );
  const headClass = "font-headline flex flex-wrap items-baseline gap-2 border-b-2 border-foreground pb-2 text-[1.35rem] leading-none uppercase";
  const caretLabel = "All your lists";

  return (
    <div ref={group} role="group" aria-label="Your lists" className="flex max-md:w-full">
      <Button variant="split" className="max-md:flex-1" onClick={() => onPick(step)}>
        <Icon aria-hidden />
        {step.label}
      </Button>
      {mobile ? (
        <Button variant="split-caret" size="icon-lg" aria-label={caretLabel} aria-expanded={sheetOpen} onClick={() => setSheetOpen(true)}>
          <ChevronDown aria-hidden />
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="split-caret" size="icon-lg" aria-label={caretLabel} />}>
            <ChevronDown aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent anchor={group} sideOffset={8} className="w-[25.6rem] px-4 pt-3.5 pb-3">
            <DropdownMenuGroup>
              <p className={`${headClass} mb-2.5`}>{head}</p>
              {rows.map((row) => (
                <DropdownMenuItem key={row.list} aria-label={shelfRowLabel(row)} onClick={() => onPick(row)} className="-mx-1.5 items-center gap-3 px-1.5 py-2.25">
                  <ShelfRowContent row={row} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2.5">
              <DropdownMenuItem render={<Link href={listLink.href} />} className="-mx-1.5 w-auto px-1.5">
                <span className="font-label text-[0.8rem] font-bold tracking-[0.07em] text-dim-foreground uppercase underline underline-offset-3">
                  {listLink.label}
                </span>
              </DropdownMenuItem>
              <span className="font-label inline-flex items-center gap-1.5 text-[0.8rem] font-bold tracking-[0.07em] text-faint-foreground uppercase">
                <Keyboard aria-hidden className="size-4" />
                Arrow keys to move
              </span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {mobile && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" showCloseButton={false} aria-labelledby={sheetTitle} className="gap-0 px-4 pt-2.5 pb-5">
            <span aria-hidden className="mx-auto mb-3 h-1 w-11 rounded-[2px] bg-border-strong" />
            <div className={`${headClass} mb-1.5`}>
              <h2 id={sheetTitle} className="contents">
                {head}
              </h2>
              <SheetClose render={<Button variant="dismiss" size="icon-sm" className="ml-auto self-center" aria-label="Close" />}>
                <X aria-hidden />
              </SheetClose>
            </div>
            {rows.map((row) => (
              <Button
                key={row.list}
                variant="pick-row"
                size="bare"
                aria-label={shelfRowLabel(row)}
                className="-mx-1.5 flex min-h-13 items-center gap-3 px-1.5 py-2.25"
                onClick={() => {
                  setSheetOpen(false);
                  onPick(row);
                }}
              >
                <ShelfRowContent row={row} />
              </Button>
            ))}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
