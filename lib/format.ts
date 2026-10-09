/**
 * Formatters shared by Ovio components. Dates are read in UTC so a label never shifts with the
 * viewer's time zone, and numbers use en-US grouping so server and client render the same text.
 */

const NUMBER = new Intl.NumberFormat("en-US");
const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const toTime = (date: string | number) => (typeof date === "string" ? Date.parse(date) : date);

/** "12,450", or shaped by Intl options: { style: "percent" } gives "86%". */
export const formatNumber = (n: number, options?: Intl.NumberFormatOptions) =>
  options ? new Intl.NumberFormat("en-US", options).format(n) : NUMBER.format(n);

/** "2026-09-30", the UTC day of an ISO date or a timestamp. */
export const isoDate = (date: string | number) => new Date(toTime(date)).toISOString().slice(0, 10);

/** "Sep 30, 2026" from an ISO date or a timestamp; a string that is not a date is returned as is. */
export function formatDate(date: string | number): string {
  const time = toTime(date);
  return Number.isNaN(time) ? String(date) : DATE.format(time);
}

/** "Sep 30", as formatDate. */
export function formatShortDate(date: string | number): string {
  const time = toTime(date);
  return Number.isNaN(time) ? String(date) : SHORT_DATE.format(time);
}

/** "Jul 2025", from a year and a 1-based month. */
export const formatMonth = (year: number, month: number) =>
  MONTH.format(Date.UTC(year, month - 1, 1));

/** "star" or "stars" after a count. */
export const plural = (n: number, noun: string, many = `${noun}s`) => (n === 1 ? noun : many);

/** "1 star", "2,400 stars". */
export const formatCount = (n: number, noun: string, many?: string) =>
  `${formatNumber(n)} ${plural(n, noun, many)}`;
