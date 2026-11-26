"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { RotateCw } from "lucide-react";
import { jumpLines } from "@/lib/misprint";
import { Button } from "@/components/ui/button";
import { LetterNote } from "./letter-note";
import { MisprintPage } from "./misprint-page";

// The error page: a page that didn't print, with the reader's letter and the
// editor owning up. Try again re-renders the page that broke. The error's
// digest (the server log's reference) rides as small print, for staff.
export function ErrorView({
  error,
  retry,
  viewer,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  viewer: "member" | "visitor";
}) {
  const address = usePathname();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MisprintPage
      folio="500"
      runningHead="Misprint"
      headline="This page didn’t print."
      jumps={jumpLines(viewer)}
      note={
        <LetterNote
          letter="Dear Club, the page started loading and then nothing. Is it me?"
          address={address}
          reply={
            <p>
              No, it&apos;s us: something broke while this page was printing. <strong>Try it again.</strong> If it keeps
              happening, tell the staff.
            </p>
          }
          action={
            <Button type="button" variant="inverse" onClick={retry}>
              Try again
              <RotateCw aria-hidden />
            </Button>
          }
          footnote={error.digest ? `Ref ${error.digest}` : null}
        />
      }
    />
  );
}
