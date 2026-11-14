import { crumbTrail } from "@/lib/crumbs";
import { RunningHead } from "@/components/issue/running-head";

// The top bar's running head: the current route as a trail (lib/crumbs),
// resolved on the server. Runs as a parallel slot beside every page in the
// app group.

export default async function Crumbs({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <RunningHead trail={await crumbTrail(slug)} />;
}
