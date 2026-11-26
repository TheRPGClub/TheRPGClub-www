import type { JumpLine } from "@/lib/misprint";
import { LetterNote } from "./letter-note";
import { MisprintPage } from "./misprint-page";

// The 404: a page torn out of the issue, with the reader's letter asking
// where it went and the editor's reply.
export function NotFoundView({ address, jumps }: { address: string | null; jumps: readonly JumpLine[] }) {
  return (
    <MisprintPage
      folio="404"
      runningHead="Page 404"
      headline="This page was torn out."
      jumps={jumps}
      note={
        <LetterNote
          letter="Dear Club, I followed a link and landed on an empty page. Was it ever here? Did I mistype it?"
          address={address}
          reply={
            <p>
              Nothing is printed at that address. The link may be old, or the page left the site.{" "}
              <strong>Pick up from one of the pages under Continued on.</strong>
            </p>
          }
        />
      }
    />
  );
}
