"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Two letters for an avatar tile: "Jana Sundar" → "JS", "ada-dev" → "AD", "jana" → "JA". */
export function initialsOf(name: string): string {
  const words = name.split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

type AvatarProps = {
  initials?: string;
  src?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * Initials on a tile, with the photo laid over them when there is one.
 * If the photo fails (or the viewer is offline) it is dropped and the initials stay.
 * The name is given as text next to it, so the picture itself is decorative.
 */
export function Avatar({ initials, src, className, style, children }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);

  return (
    <span
      aria-hidden
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      style={style}
    >
      {initials}
      {src && failed !== src && (
        // A plain img: photos come from any host, and next/image would need each one configured.
        // oxlint-disable-next-line next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(src)}
          className="absolute inset-0 size-full rounded-[inherit] object-cover"
        />
      )}
      {children}
    </span>
  );
}
