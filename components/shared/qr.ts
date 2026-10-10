import { encode } from "uqr";

/**
 * A QR code as one SVG path in a size × size viewBox: square modules, or round dots. Plain, so
 * the QrCode component and anything drawn on the server (the README embeds) share it.
 */
export function qrPath(value: string, { dots = false, border = 1 } = {}) {
  const qr = encode(value, { ecc: "M", border });
  let d = "";
  qr.data.forEach((row, y) =>
    row.forEach((on, x) => {
      if (!on) return;
      d += dots
        ? `M${x + 0.5} ${y + 0.08}a.42 .42 0 1 1 0 .84a.42 .42 0 1 1 0-.84z`
        : `M${x} ${y}h1v1h-1z`;
    }),
  );
  return { size: qr.size, d };
}
