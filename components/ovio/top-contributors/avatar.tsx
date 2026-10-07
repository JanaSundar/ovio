"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { RankedContributor } from "./top-contributors";

type AvatarProps = {
  person: RankedContributor;
  className?: string;
  style?: CSSProperties;
};

/**
 * Initials on a tile, with the avatar image laid over them when there is one.
 * If the image fails (or the viewer is offline) it is dropped and the initials stay.
 * The name is given as text next to every avatar, so the picture itself is decorative.
 */
export function Avatar({ person, className, style }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = person.avatarUrl && failed !== person.avatarUrl;

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
      style={style}
    >
      {person.initials}
      {showImage && (
        // A plain img: avatars come from any host, and next/image would need each one configured.
        // oxlint-disable-next-line next/no-img-element
        <img
          src={person.avatarUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(person.avatarUrl ?? null)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}
