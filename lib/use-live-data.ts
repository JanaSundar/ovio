import { useCallback, useEffect, useSyncExternalStore } from "react";

export type LiveStatus = "idle" | "loading" | "live" | "error";

type Entry = { status: Exclude<LiveStatus, "idle">; data?: unknown; error?: Error };

// Shared across components, so a remount (or another component on the same URL) never refetches.
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

function update(url: string, entry: Entry) {
  entries.set(url, entry);
  listeners.get(url)?.forEach((notify) => notify());
}

function load(url: string) {
  if (entries.has(url)) return;
  update(url, { status: "loading" });
  // Browsers may cache a response with no max-age on their own; the server's cache is the one
  // that spares the API, so always ask it.
  fetch(url, { cache: "no-cache" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`${url} responded ${res.status}`);
      const data = await res.json();
      if (data === null) throw new Error(`${url} has no data`);
      update(url, { status: "live", data });
    })
    .catch((error: Error) => update(url, { status: "error", error }));
}

function reload(url: string) {
  entries.delete(url);
  load(url);
}

/**
 * JSON from `url`, fetched once per page load and shared by every component that asks. `data` is
 * `fallback` until the response arrives, and stays `fallback` if the request fails or the body
 * is `null`.
 */
export function useLiveData<T>(url: string, fallback: T) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const set = listeners.get(url) ?? new Set();
      listeners.set(url, set.add(notify));
      return () => set.delete(notify);
    },
    [url],
  );
  const entry = useSyncExternalStore(
    subscribe,
    () => entries.get(url),
    () => undefined,
  );
  useEffect(() => load(url), [url]);

  return {
    status: entry?.status ?? ("idle" as LiveStatus),
    data: entry?.status === "live" ? (entry.data as T) : fallback,
    error: entry?.error,
    retry: () => reload(url),
  };
}
