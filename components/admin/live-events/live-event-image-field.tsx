import { ImageIcon, Link2, Upload, X } from "lucide-react";
import { IMAGE_ACCEPT } from "@/lib/live-events";
import type { ImageMode } from "@/hooks/use-live-event-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LIVE_EVENT_LABEL } from "./live-event-clock";

function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface ImageFieldState {
  mode: ImageMode;
  file: File | null;
  url: string;
  setUrl: (url: string) => void;
  pickFile: (file: File | null) => void;
  clearFile: () => void;
  switchMode: (mode: ImageMode) => void;
}

// The optional image: a file (the whole slip is its picker, naming the file
// once picked) or a URL, with a switch between the two.
export function LiveEventImageField({
  image,
  fileInput,
  disabled,
}: {
  image: ImageFieldState;
  fileInput: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
}) {
  const { file } = image;
  return (
    <fieldset className="mt-5" disabled={disabled}>
      <legend className={LIVE_EVENT_LABEL}>
        Image (optional)
      </legend>
      <div className="mt-1 flex flex-wrap items-center gap-2.5">
        {image.mode === "file" ? (
          <>
            <label className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm focus-within:border-faint-foreground focus-within:ring-2 focus-within:ring-highlight/40">
              <ImageIcon aria-hidden className="size-4 shrink-0 text-faint-foreground" />
              <span className={cn("min-w-0 truncate", file ? "text-foreground" : "text-faint-foreground")}>
                {file ? file.name : "Choose a JPEG, PNG, WebP or GIF"}
              </span>
              {file && <span className="ml-auto shrink-0 text-[0.82rem] text-faint-foreground">{fileSize(file.size)}</span>}
              {!file && <Upload aria-hidden className="ml-auto size-4 shrink-0 text-faint-foreground" />}
              <Input
                ref={fileInput}
                type="file"
                name="image"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                onChange={(e) => image.pickFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <Button type="button" variant="ghost" size="icon-sm" onClick={image.clearFile} aria-label="Remove the image">
                <X />
              </Button>
            )}
            <span className="text-[0.84rem] text-faint-foreground">or</span>
            <Button type="button" variant="outline" size="sm" onClick={() => image.switchMode("url")}>
              <Link2 data-icon="inline-start" />
              Use a URL
            </Button>
          </>
        ) : (
          <>
            <Input
              type="url"
              name="image_url"
              inputMode="url"
              aria-label="Image URL"
              placeholder="https://..."
              value={image.url}
              onChange={(e) => image.setUrl(e.target.value)}
              className="min-w-0 flex-1 basis-56"
            />
            <span className="text-[0.84rem] text-faint-foreground">or</span>
            <Button type="button" variant="outline" size="sm" onClick={() => image.switchMode("file")}>
              <Upload data-icon="inline-start" />
              Upload a file
            </Button>
          </>
        )}
      </div>
      <p className="mt-1.5 text-[0.82rem] text-faint-foreground">At most 4 MB; for a larger image, link it by URL. The bot puts it on the thread and the event.</p>
    </fieldset>
  );
}
