"use client";

import { cn } from "@/lib/utils";

export default function MenuImage({ src, alt, className }) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary text-muted-foreground",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || ""} className={cn("object-cover", className)} />
  );
}
