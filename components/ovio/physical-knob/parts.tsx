export type TickStyle = {
  /** Radius of the tick ring in px; the ring is 2R square. */
  R: number;
  count: number;
  /** Every nth tick is major. */
  major: number;
  majorH: number;
  minorH: number;
  majorW: string;
  minorW: string;
  on: string;
  off: string;
  top?: number;
  rounded?: boolean;
};

/** Tick marks around the dial, lit up to the current value. */
export function KnobTicks({ s, percent }: { s: TickStyle; percent: number }) {
  return (
    <>
      {Array.from({ length: s.count }, (_, i) => {
        const major = i % s.major === 0;
        const lit = (i / (s.count - 1)) * 100 <= percent + 0.01;
        return (
          <span
            key={i}
            aria-hidden
            className="absolute"
            style={{
              left: s.R - (major ? 1.5 : 0.5),
              top: s.top ?? 0,
              width: major ? s.majorW : s.minorW,
              height: major ? s.majorH : s.minorH,
              marginLeft: s.rounded && major ? -1 : 0,
              borderRadius: s.rounded ? 1 : 0,
              background: lit ? s.on : s.off,
              transformOrigin: `50% ${s.R}px`,
              transform: `rotate(${(-135 + (i * 270) / (s.count - 1)).toFixed(2)}deg)`,
            }}
          />
        );
      })}
    </>
  );
}
