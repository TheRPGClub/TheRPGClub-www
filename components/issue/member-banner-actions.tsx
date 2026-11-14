import { FileUp, Pencil } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

// The owner's own actions, top-right of their banner: imports (when there is
// anything to import) and edit.
export function BannerOwnerActions({
  editHref,
  importsHref,
}: {
  editHref: string;
  importsHref: string | null;
}) {
  return (
    <div className="absolute top-3 right-3 z-10 flex gap-2 sm:top-5 sm:right-5">
      {importsHref && (
        <ButtonLink
          href={importsHref}
          variant="overlay"
          size="sm"
        >
          <FileUp data-icon="inline-start" />
          Imports
        </ButtonLink>
      )}
      <ButtonLink
        href={editHref}
        variant="overlay"
        size="sm"
      >
        <Pencil data-icon="inline-start" />
        Edit profile
      </ButtonLink>
    </div>
  );
}
