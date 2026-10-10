"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import type { CSSProperties } from "react";

/** NumberFlow's spring as a CSS linear() curve: critically damped, about 0.9s. */
function springEasing(duration = 0.9, w = 7.5, samples = 40) {
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (duration * i) / samples;
    points.push(i === samples ? "1" : (1 - Math.exp(-w * t) * (1 + w * t)).toFixed(4));
  }
  return `linear(${points.join(",")})`;
}

/** How a change shows: the full 0.9s roll, a quick 0.3s one, or none (the digits just change). */
export type RollingTiming = "roll" | "quick" | "none";

const SPIN_TIMING = {
  roll: { duration: 900, easing: springEasing() },
  quick: { duration: 300, easing: springEasing(0.3, 22) },
};
// NumberFlow eases its width and every digit's x position on transformTiming. Zero means a digit
// added or dropped resizes the number at once, so neighbours never slide and digits roll in place.
const LAYOUT_TIMING = { duration: 0, easing: "linear" };
const OPACITY_TIMING = {
  roll: { duration: 450, easing: "ease-out" },
  quick: { duration: 150, easing: "ease-out" },
};

export type RollingNumberProps = {
  value: number;
  format?: Format;
  locales?: Intl.LocalesArgument;
  prefix?: string;
  suffix?: string;
  /** Spin direction: 1 up, -1 down, 0 shortest. Defaults to the direction of the change. */
  trend?: number;
  /** "quick" for numbers that change often or under a finger, "none" for hard-frame worlds. Defaults to "roll". */
  timing?: RollingTiming;
  className?: string;
  style?: CSSProperties;
};

/**
 * A number whose digits roll in place on change: 0.9s spring spin, 0.45s fade, tabular width
 * that snaps to the new value so neighbours never slide, and it continues from where it is
 * when interrupted. Static under prefers-reduced-motion.
 */
export function RollingNumber({
  value,
  format,
  locales = "en-US",
  prefix,
  suffix,
  trend,
  timing = "roll",
  className,
  style,
}: RollingNumberProps) {
  const pace = timing === "none" ? "quick" : timing;
  return (
    <NumberFlow
      value={value}
      format={format}
      locales={locales}
      prefix={prefix}
      suffix={suffix}
      {...(trend !== undefined && { trend })}
      transformTiming={LAYOUT_TIMING}
      spinTiming={SPIN_TIMING[pace]}
      opacityTiming={OPACITY_TIMING[pace]}
      animated={timing !== "none"}
      respectMotionPreference
      className={className}
      style={{ fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}
