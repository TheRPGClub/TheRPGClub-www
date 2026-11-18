"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteChallengeAction } from "@/app/actions/challenges";
import { Button } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";

// The duplicate-name warning, on the new Challenge's page (the API warns
// after creating): a notice slip pointing at the Challenge that already has
// the name, with "Delete this one" for a Host who'd rather join it.
export function DuplicateNotice({
  challengeId,
  name,
  otherId,
}: {
  challengeId: number;
  name: string;
  otherId: number | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remove = () =>
    startTransition(async () => {
      const result = await deleteChallengeAction(challengeId);
      if (result.ok) router.push(otherId ? `/challenges/${otherId}` : "/challenges");
      else setError(result.error ?? "That didn't work.");
    });
  return (
    <NoticeSlip
      title="That name is taken"
      dismissHref={`/challenges/${challengeId}`}
      className="mt-8 max-w-xl"
      action={
        <Button type="button" variant="inverse" onClick={remove} disabled={pending}>
          {pending ? "Deleting…" : "Delete this one"}
        </Button>
      }
    >
      There&apos;s already a Challenge called <strong>{name}</strong>.{" "}
      {otherId ? (
        <Link href={`/challenges/${otherId}`} className="font-semibold text-background underline underline-offset-2">
          Join it instead?
        </Link>
      ) : (
        "Join it instead?"
      )}
      {error && (
        <span role="alert" className="mt-2 block font-semibold text-background">
          {error}
        </span>
      )}
    </NoticeSlip>
  );
}
