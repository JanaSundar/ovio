import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchJson, fetchOk, HttpError, RateLimitError, resetTime } from "@/lib/ovio-fetch";

const NOW = Date.UTC(2026, 9, 9, 12, 0, 0);

/** Answers every fetch with this status, headers and body. */
const respond = (status: number, headers: Record<string, string> = {}, body: unknown = {}) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status, headers })),
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("resetTime", () => {
  it("reads Retry-After as seconds or a date, then X-RateLimit-Reset", () => {
    expect(resetTime(new Headers({ "retry-after": "90" }))).toBe(NOW + 90_000);
    expect(resetTime(new Headers({ "retry-after": "Fri, 09 Oct 2026 12:30:00 GMT" }))).toBe(
      NOW + 30 * 60_000,
    );
    expect(resetTime(new Headers({ "x-ratelimit-reset": String(NOW / 1000 + 600) }))).toBe(
      NOW + 600_000,
    );
    expect(resetTime(new Headers())).toBeUndefined();
  });
});

describe("fetchOk", () => {
  it("returns OK responses, including a 202", async () => {
    respond(202);
    expect((await fetchOk("https://api.github.com/x")).status).toBe(202);
  });

  it("passes the cache window and a timeout signal to fetch", async () => {
    respond(200);
    await fetchOk("https://api.npmjs.org/x", { revalidate: 60 });
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit & { next: object };
    expect(init.next).toEqual({ revalidate: 60 });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws RateLimitError on 429, with when it resets", async () => {
    respond(429, { "retry-after": "720" });
    const error = await fetchOk("https://bundlephobia.com/api/size").catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.resetAt).toBe(NOW + 720_000);
    expect(error.message).toBe("bundlephobia.com rate limit reached, resets in 12 min");
  });

  it("treats GitHub's 403 with no requests left as a rate limit", async () => {
    respond(403, {
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": String(NOW / 1000 + 300),
    });
    await expect(fetchOk("https://api.github.com/repos/a/b")).rejects.toThrow(
      "github.com rate limit reached, resets in 5 min",
    );
  });

  it("treats a 403 with Retry-After as GitHub's secondary limit", async () => {
    respond(403, { "retry-after": "60" });
    await expect(fetchOk("https://api.github.com/x")).rejects.toBeInstanceOf(RateLimitError);
  });

  it("throws HttpError for other failures, a plain 403 included", async () => {
    respond(403, { "x-ratelimit-remaining": "41" });
    const error = await fetchOk("https://api.github.com/x").catch((e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).not.toBeInstanceOf(RateLimitError);
    expect(error.status).toBe(403);
  });

  it("leaves the query, where keys can be, out of the message", async () => {
    respond(403);
    await expect(
      fetchOk("https://ws.audioscrobbler.com/2.0/?api_key=secret&method=x"),
    ).rejects.toThrow("ws.audioscrobbler.com/2.0/ responded 403");
  });

  it("turns a timeout into a 504 HttpError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation timed out.", "TimeoutError");
      }),
    );
    await expect(fetchOk("https://bundlephobia.com/x", { timeout: 2000 })).rejects.toMatchObject({
      status: 504,
      message: "bundlephobia.com did not answer within 2s",
    });
  });
});

describe("fetchJson", () => {
  it("parses the body", async () => {
    respond(200, {}, { downloads: 12 });
    expect(await fetchJson<{ downloads: number }>("https://api.npmjs.org/x")).toEqual({
      downloads: 12,
    });
  });
});
