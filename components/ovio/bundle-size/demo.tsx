"use client";

import { BundleSize, type BundleVersion } from "./bundle-size";

/** The last three releases of the fictional "lumen" package, newest first. */
const VERSIONS: BundleVersion[] = [
  { version: "1.2.0", raw: 24_800, gzip: 7_200, brotli: 6_100, dependencies: 0 },
  { version: "1.1.0", raw: 27_070, gzip: 7_900, brotli: 6_700, dependencies: 1 },
  { version: "1.0.0", raw: 30_400, gzip: 9_100, brotli: 7_800, dependencies: 2 },
];

export function BundleSizeDemo() {
  return <BundleSize pkg="lumen" versions={VERSIONS} budget={40} />;
}
