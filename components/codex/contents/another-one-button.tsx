"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";

// Draws another Fun Fact for the band: the page reads again and picks one.
// It only reads, so it never moves the Daily Fun Fact's queue.
export function AnotherOneButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <Dices aria-hidden />
      {pending ? "Drawing…" : "Another one"}
    </Button>
  );
}
