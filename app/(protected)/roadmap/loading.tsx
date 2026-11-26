import { RouteSkeleton } from "@/components/templates/route-skeleton";

// Beside the section's layout, not above it: a Feature gate there stays
// outside this boundary, so a hidden Feature still answers 404 on a full load.
export default function Loading() {
  return <RouteSkeleton />;
}
