"use client";

import type { useTypedConfirm } from "@/hooks/use-typed-confirm";
import { Input } from "@/components/ui/input";

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
      <label htmlFor={`${id}-words`} className="sr-only">
        Type {words} to confirm
      </label>
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
