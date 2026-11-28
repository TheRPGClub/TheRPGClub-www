"use client";

import { useState, useTransition } from "react";
import { signUpAction } from "@/app/actions/challenge-editions";
import { Button } from "@/components/ui/button";

// Sign up for an Assignment Challenge's Edition from a flyer or billboard
// (surface brief challenges-index): the yellow call to action, through the
// same action as the Edition page's panel. The board then shows "Signed up".
// A refusal (a short backlog, sign-up closed) is pinned under it as a small
// paper slip in the API's own words.
export function SignUpButton({ editionId }: { editionId: number }) {
  const [slip, setSlip] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const signUp = () =>
    startTransition(async () => {
      setSlip(null);
      const result = await signUpAction(editionId);
      if (!result.ok) setSlip(result.error ?? "That didn't work. Try again.");
    });
  return (
    <div className="relative z-10 flex flex-col items-start gap-2.5">
      <Button type="button" variant="highlight" size="sm" disabled={pending} onClick={signUp}>
        {pending ? "Signing up…" : "Sign up"}
      </Button>
      {slip && (
        <p
          role="alert"
          data-slot="run-slip"
          className="max-w-[34ch] rounded-xs bg-foreground px-3 py-2 text-[0.85rem] leading-[1.4] text-background"
        >
          {slip}
        </p>
      )}
    </div>
  );
}
