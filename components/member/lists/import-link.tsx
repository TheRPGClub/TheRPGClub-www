import { FileUp } from "lucide-react";
import { importsHubHref } from "@/lib/imports/kinds";
import { ButtonLink } from "@/components/ui/button";

// "Import" on the member's own list pages: the imports hub.
export function ImportLink({ userId }: { userId: string }) {
  return (
    <ButtonLink href={importsHubHref(userId)} variant="outline">
      <FileUp data-icon="inline-start" /> Import
    </ButtonLink>
  );
}
