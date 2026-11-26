"use client";

import { ErrorView } from "@/components/misprint/error-view";

// A signed-in page that broke while rendering. It sits inside the protected
// layout, so the sidebar stays put around the misprint.
export default function ProtectedError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorView error={error} retry={unstable_retry} viewer="member" />;
}
