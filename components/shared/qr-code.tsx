"use client";

import { useMemo, type CSSProperties } from "react";
import { encode } from "uqr";
import { cn } from "@/lib/utils";

type QrCodeProps = {
  value: string;
  /** Round dots instead of square modules. */
  dots?: boolean;
  /** Quiet zone around the code, in modules. */
  border?: number;
  /** Accessible name. Defaults to "QR code for {value}". */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** A QR code as SVG in the current text colour: crisp square modules, or round dots. */
export function QrCode({ value, dots, border = 1, label, className, style }: QrCodeProps) {
  const { size, d } = useMemo(() => {
    const qr = encode(value, { ecc: "M", border });
    let path = "";
    qr.data.forEach((row, y) =>
      row.forEach((on, x) => {
        if (!on) return;
        path += dots
          ? `M${x + 0.5} ${y + 0.08}a.42 .42 0 1 1 0 .84a.42 .42 0 1 1 0-.84z`
          : `M${x} ${y}h1v1h-1z`;
      }),
    );
    return { size: qr.size, d: path };
  }, [value, dots, border]);

  return (
    <svg
      role="img"
      aria-label={label ?? `QR code for ${value}`}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering={dots ? undefined : "crispEdges"}
      className={cn("block aspect-square shrink-0", className)}
      style={style}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}
