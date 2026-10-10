/** One published version. Sizes are in bytes. */
export type BundleVersion = {
  version: string;
  raw: number;
  gzip: number;
  /** Leave out to hide the row. */
  brotli?: number;
  /** Runtime dependency count. Leave out to hide the row. */
  dependencies?: number;
};
