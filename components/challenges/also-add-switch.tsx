"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/switch";

// "Also add to <list>" (www#172): the switch in the Pool editor's save
// prompt and the Accept dialog, shown only when the viewer may add to the
// Challenge's linked Game List. Off by default, so a list changes only when
// its owner asks.
export function AlsoAddSwitch({
  listName,
  checked,
  onChange,
}: {
  listName: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[0.95rem] font-semibold text-foreground">
          Also add to {listName}
        </label>
        <p className="mt-1 text-[0.85rem] text-faint-foreground">Leave it off to keep the list as it is.</p>
      </div>
    </div>
  );
}
