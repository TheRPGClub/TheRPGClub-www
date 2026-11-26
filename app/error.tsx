"use client";

import { BareFrame } from "@/components/misprint/bare-frame";
import { ErrorView } from "@/components/misprint/error-view";

// A public page that broke, or the protected layout itself (the shell's
// reads): no shell to keep, so the misprint stands in the bare frame.
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <BareFrame>
      <ErrorView error={error} retry={unstable_retry} viewer="visitor" />
    </BareFrame>
  );
}
