"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// A Bug Report's screenshot as a thumbnail on its card; a click opens it
// full size in a dialog.
export function ScreenshotThumb({ url, title }: { url: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger className="mt-2.5 block w-full" aria-label={`Enlarge the screenshot for ${title}`}>
        <span className="block overflow-hidden rounded-sm border border-border bg-background transition-opacity hover:opacity-85">
          {/* eslint-disable-next-line @next/next/no-img-element -- a member's upload on the club's B2 bucket, which next/image isn't configured for */}
          <img src={url} alt="" loading="lazy" className="block max-h-36 w-full object-cover object-top" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogTitle>Screenshot</DialogTitle>
        {/* eslint-disable-next-line @next/next/no-img-element -- a member's upload on the club's B2 bucket, which next/image isn't configured for */}
        <img src={url} alt={`Screenshot for ${title}`} className="h-auto max-h-[75dvh] w-full object-contain" />
      </DialogContent>
    </Dialog>
  );
}
