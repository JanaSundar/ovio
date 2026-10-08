/**
 * The goo filter: blur the shapes together, then cut the alpha back to a hard edge.
 * `crisp` lays the unblurred shapes back on top, so only the gaps between them go gooey.
 */
export function GooFilter({
  id,
  blur = 9,
  crisp = false,
}: {
  id: string;
  blur?: number;
  crisp?: boolean;
}) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
          <feColorMatrix
            in="b"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
            result="goo"
          />
          {crisp && <feComposite in="SourceGraphic" in2="goo" operator="atop" />}
        </filter>
      </defs>
    </svg>
  );
}
