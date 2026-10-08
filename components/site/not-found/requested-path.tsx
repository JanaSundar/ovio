"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * The address that wasn't found. The 404 page is prerendered once, so the server can't know it:
 * render nothing there and fill it in on the client, without a hydration mismatch.
 */
export function RequestedPath() {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  return <>{hydrated ? pathname : ""}</>;
}
