import type { Metadata } from "next";
import { headers } from "next/headers";
import { getFeatures } from "@/lib/session";
import { jumpLines } from "@/lib/misprint";
import { RETURN_TO_HEADER } from "@/lib/sign-in";
import { NotFoundView } from "@/components/misprint/not-found-view";

export const metadata: Metadata = { title: "Page not found · The RPG Club" };

// A signed-in page that calls notFound() (a Feature hidden from the viewer,
// a game or member that isn't there). The protected layout's shell is
// already around it; the proxy names the page in a header.
export default async function ProtectedNotFound() {
  const [features, head] = await Promise.all([getFeatures(), headers()]);
  return <NotFoundView address={head.get(RETURN_TO_HEADER)} jumps={jumpLines("member", features)} />;
}
