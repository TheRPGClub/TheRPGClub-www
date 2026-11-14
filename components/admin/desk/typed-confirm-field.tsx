"use client";

import type { useTypedConfirm } from "@/hooks/use-typed-confirm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The typed confirm's field: the words go here; it turns orange once they
// match, and Enter confirms. The action's error shows under it.
export function TypedConfirmField({
  id,
  words,
  confirm,
}: {
  id: string;
  words: string;
  confirm: ReturnType<typeof useTypedConfirm>;
}) {
  return (
    <div>
      <Label htmlFor={`${id}-words`} variant="field" className="sr-only">
        Type {words} to confirm
      </Label>
      <Input
        id={`${id}-words`}
        value={confirm.typed}
        onChange={(e) => confirm.setTyped(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            confirm.confirm();
          }
        }}
        aria-describedby={`${id}-how`}
        autoComplete="off"
        spellCheck={false}
        variant={confirm.ready ? "destructive" : "inset"}
      />
      {confirm.error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {confirm.error}
        </p>
      )}
    </div>
  );
}
