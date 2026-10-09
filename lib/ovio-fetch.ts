/** Native fetch with Next's data cache, a timeout, and errors that say when a rate limit resets. */

export const DEFAULT_REVALIDATE = 3600;
export const DEFAULT_TIMEOUT = 10_000;

export type FetchOptions = { revalidate?: number; timeout?: number };

export type RequestOptions = Pick<RequestInit, "method" | "body"> & {
  headers?: Record<string, string>;
};

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class RateLimitError extends HttpError {
  constructor(
    readonly service: string,
    status: number,
    readonly resetAt?: number,
  ) {
    const minutes = resetAt && Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
    super(`${service} rate limit reached${minutes ? `, resets in ${minutes} min` : ""}`, status);
    this.name = "RateLimitError";
  }
}

const serviceOf = (url: string) => new URL(url).hostname.replace(/^(api|www)\./, "");

/** Retry-After (seconds or a date) wins over X-RateLimit-Reset (Unix seconds). */
export function resetTime(headers: Headers): number | undefined {
  const retry = headers.get("retry-after");
  if (retry) {
    const seconds = Number(retry);
    return Number.isNaN(seconds) ? Date.parse(retry) || undefined : Date.now() + seconds * 1000;
  }
  const reset = Number(headers.get("x-ratelimit-reset"));
  return reset ? reset * 1000 : undefined;
}

// GitHub signals its limits with a 403: primary when no requests remain, secondary via Retry-After.
const isRateLimited = (res: Response) =>
  res.status === 429 ||
  (res.status === 403 &&
    (res.headers.get("x-ratelimit-remaining") === "0" || res.headers.has("retry-after")));

/** Returns any OK response, a 202 included; throws RateLimitError or HttpError otherwise. */
export async function fetchOk(
  url: string,
  { revalidate = DEFAULT_REVALIDATE, timeout = DEFAULT_TIMEOUT }: FetchOptions = {},
  init: RequestOptions = {},
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout), next: { revalidate } });
  } catch (e) {
    if (e instanceof DOMException && e.name === "TimeoutError")
      throw new HttpError(`${serviceOf(url)} did not answer within ${timeout / 1000}s`, 504);
    throw e;
  }
  if (res.ok) return res;
  if (isRateLimited(res))
    throw new RateLimitError(serviceOf(url), res.status, resetTime(res.headers));
  // Host and path only: some APIs take their key in the query, and messages end up in logs.
  const { host, pathname } = new URL(url);
  throw new HttpError(`${host}${pathname} responded ${res.status}`, res.status);
}

export async function fetchJson<T>(
  url: string,
  options?: FetchOptions,
  init?: RequestOptions,
): Promise<T> {
  return (await (await fetchOk(url, options, init)).json()) as T;
}
