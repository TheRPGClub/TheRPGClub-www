"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { SentCompletion } from "@/hooks/use-completion-form";
import { ProofCard } from "@/components/admin/desk/proof-card";

// The proof of the bot's post beside the form: stamped and following the
// announcement job once sent, otherwise with a note on what will (or did
// not) get posted.
export function CompletionProofPanel({
  sent,
  announce,
  children,
}: {
  sent: SentCompletion | null;
  announce: boolean;
  children: ReactNode;
}) {
  if (sent?.announced && sent.jobId) {
    return (
      <ProofCard jobId={sent.jobId} what="The completion post" overhang>
        {children}
      </ProofCard>
    );
  }
  const caption = sent ? (
    sent.announced ? (
      <>
        Announced, but its bot job didn&apos;t come back with the reply. Follow it on{" "}
        <Link href="/admin" className="underline underline-offset-3">
          the wire
        </Link>
        .
      </>
    ) : (
      "Logged without an announcement. Nothing was posted."
    )
  ) : announce ? (
    "The bot adds each member's emoji, and a line when it is the club's first completion of the game."
  ) : (
    "Announce is off: nothing is posted, the completion only goes on their profile."
  );
  return <ProofCard caption={caption}>{children}</ProofCard>;
}
