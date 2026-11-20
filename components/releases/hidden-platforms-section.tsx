import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import type { useHiddenPlatforms } from "@/hooks/use-hidden-platforms";
import { Button } from "@/components/ui/button";
import { PopoverTitle } from "@/components/ui/popover";

// The platform filter's lower half: the member's Hidden Platforms, never
// shown, each with Unhide; then what they are, and that Settings keeps the
// same list. A failed save says why here, where the click was.
export function HiddenPlatformsSection({
  ids,
  names,
  saves,
}: {
  ids: readonly number[];
  names: Map<number, string>;
  saves: ReturnType<typeof useHiddenPlatforms>;
}) {
  const rows = ids
    .map((id) => ({ id, name: names.get(id) ?? "Unknown platform" }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {rows.length > 0 && (
        <div className="border-t border-border p-3 pt-2.5 pb-2">
          <PopoverTitle render={<h3 />} className="mb-1.5 px-1">
            Hidden Platforms · never shown
          </PopoverTitle>
          <ul aria-label="Hidden Platforms">
            {rows.map((p) => (
              <li key={p.id} className="flex min-h-9 items-center gap-2.5 pr-1 pl-1">
                <EyeOff aria-hidden className="size-4 shrink-0 text-faint-foreground" />
                <span className="min-w-0 flex-1 truncate text-faint-foreground">{p.name}</span>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={saves.pending}
                  aria-label={`Unhide ${p.name}`}
                  onClick={() => saves.unhide(p.id)}
                >
                  <Eye data-icon="inline-start" aria-hidden />
                  Unhide
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {saves.error && (
        <p role="alert" className="border-t border-border px-4 py-2.5 text-sm text-destructive">
          {saves.error}
        </p>
      )}
      <p className="border-t border-border px-4 py-3 text-[0.8125rem] leading-snug text-dim-foreground">
        Hidden Platforms stay off your calendar and your Upcoming Releases panel. Change them here or in{" "}
        <Link
          href="/settings"
          className="rounded-xs text-foreground underline decoration-gotm decoration-2 underline-offset-4 transition-colors outline-none hover:text-highlight focus-visible:ring-3 focus-visible:ring-highlight/50"
        >
          Settings
        </Link>
        .
      </p>
    </>
  );
}
