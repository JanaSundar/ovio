/** Converts between a value and a detent index for a world's number of steps. */
export function detents(min: number, max: number, steps: number) {
  const span = max - min || 1;
  return {
    toIndex: (value: number) => Math.round(((value - min) / span) * (steps - 1)),
    toValue: (index: number) => {
      const v = min + (index * span) / (steps - 1);
      return Math.round(v * 1000) / 1000;
    },
  };
}
