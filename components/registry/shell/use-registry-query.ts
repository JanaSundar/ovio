"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseQuery, queryString, type RegistryQuery } from "@/lib/registry/query";
import { BROWSE, isBrowsePage } from "./links";

/**
 * The registry query lives in the URL, so filters are shareable and Back undoes them. On a browse
 * page an update replaces the URL in place; anywhere else it opens the component list.
 */
export function useRegistryQuery() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = useMemo(() => parseQuery(params), [params]);

  const update = useCallback(
    (patch: Partial<RegistryQuery>) => {
      if (isBrowsePage(pathname)) {
        router.replace(`${pathname}${queryString({ ...query, ...patch })}`, { scroll: false });
      } else {
        router.push(`${BROWSE}${queryString(patch)}`);
      }
    },
    [pathname, query, router],
  );

  return { query, update, pathname };
}
