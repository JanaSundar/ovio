import { useCallback, useEffect, useEffectEvent, useSyncExternalStore } from "react";

export type LiveStatus = "idle" | "loading" | "live" | "error";

type Entry = {
  status: Exclude<LiveStatus, "idle">;
  data?: unknown;
  error?: Error;
  /** Set once onError has seen this failure, so remounts don't report it again. */
  reported?: boolean;
};

export type LiveDataOptions = {
  /** Called once per failed request, with a retry. Show a toast here, or log it. */
  onError?: (error: Error, retry: () => void) => void;
  /** Fetches again this often (ms) while the tab is visible, keeping what's shown on a failure. */
  refreshMs?: number;
};

// Shared across components, so a remount (or another component on the same URL) never refetches.
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

function update(url: string, entry: Entry) {
  entries.set(url, entry);
  listeners.get(url)?.forEach((notify) => notify());
}

async function request(url: string) {
  // Browsers may cache a response with no max-age on their own; the server's cache is the one
  // that spares the API, so always ask it.
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `${url} responded ${res.status}`);
  }
  const data = await res.json();
  if (data === null) throw new Error(`${url} has no data`);
  return data;
}

function load(url: string) {
  if (entries.has(url)) return;
  update(url, { status: "loading" });
  request(url).then(
    (data) => update(url, { status: "live", data }),
    (error: Error) => update(url, { status: "error", error }),
  );
}

function reload(url: string) {
  entries.delete(url);
  load(url);
}

const refreshing = new Set<string>();

/** Fetches again in the background; only a success replaces what's shown. */
function refresh(url: string) {
  if (refreshing.has(url) || entries.get(url)?.status === "loading") return;
  refreshing.add(url);
  request(url)
    .then((data) => update(url, { status: "live", data }))
    .catch(() => {})
    .finally(() => refreshing.delete(url));
}

/**
 * JSON from `url`, fetched once per page load and shared by every component that asks. `data` is
 * `fallback` until the response arrives, and stays `fallback` if the request fails or the body
 * is `null`. A failed response's `{ error }` field becomes the error message.
 */
export function useLiveData<T>(
  url: string,
  fallback: T,
  { onError, refreshMs }: LiveDataOptions = {},
) {
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
  useEffect(() => {
    if (!refreshMs) return;
    const timer = setInterval(() => document.hidden || refresh(url), refreshMs);
    return () => clearInterval(timer);
  }, [url, refreshMs]);

  const report = useEffectEvent((failed: Entry) => {
    failed.reported = true;
    onError?.(failed.error!, () => reload(url));
  });
  useEffect(() => {
    if (entry?.status === "error" && !entry.reported) report(entry);
  }, [entry]);

  return {
    status: entry?.status ?? ("idle" as LiveStatus),
    data: entry?.status === "live" ? (entry.data as T) : fallback,
    error: entry?.error,
    retry: () => reload(url),
  };
}
