"use client";

import { useEffect, useState } from "react";

// A chosen file as a data URL for its preview (a staged image upload), or
// null until it's read.
export function useFilePreview(file: File | undefined): string | null {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" && setPreview({ file, url: reader.result });
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  return preview && preview.file === file ? preview.url : null;
}
