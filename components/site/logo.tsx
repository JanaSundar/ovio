import Link from "next/link";

/** The Ovio mark: an open ring with a tail, white on black. */
function OvioMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      aria-hidden
      className={className}
      style={{ borderRadius: size * 0.27, display: "block" }}
    >
      <rect width="96" height="96" fill="#000" />
      <path
        d="M70 26 A30 30 0 1 0 78 52 C80 40 84 34 90 30"
        fill="none"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-(family-name:--font-geist) text-[17px] font-semibold tracking-[-0.01em] hover:text-ink"
    >
      <OvioMark size={28} />
      Ovio
    </Link>
  );
}
