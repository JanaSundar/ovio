import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { getNowPlaying, lastfm, musicService } = await import("@/lib/music");

const TRACK = { title: "Song", artist: "Band", duration: 200 };

/** Answers each fetch with the next body. */
const respond = (...bodies: unknown[]) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(bodies.shift()))),
  );

afterEach(() => vi.unstubAllGlobals());

describe("getNowPlaying", () => {
  const service = (name: string, attached: boolean, now: unknown) => ({
    name,
    attached,
    nowPlaying: vi.fn(async () => now as never),
  });

  it("throws when no service is attached, naming them", async () => {
    await expect(
      getNowPlaying([service("A", false, null), service("B", false, null)]),
    ).rejects.toThrow("set credentials for A or B");
  });

  it("skips unattached services and returns the first answer", async () => {
    const skipped = service("Off", false, { service: "Off" });
    const quiet = service("Quiet", true, null);
    const playing = service("On", true, { service: "On" });
    expect(await getNowPlaying([skipped, quiet, playing])).toEqual({ service: "On" });
    expect(skipped.nowPlaying).not.toHaveBeenCalled();
  });
});

describe("musicService", () => {
  it("adapts any JSON API with map", async () => {
    respond({ song: { name: "Song", by: "Band", secs: 200, at: 12 } });
    const radio = musicService<{ song: { name: string; by: string; secs: number; at: number } }>({
      name: "Radio",
      url: "https://radio.example/now.json",
      map: ({ song }) => ({
        track: { title: song.name, artist: song.by, duration: song.secs },
        progress: song.at,
        playing: true,
      }),
    });
    expect(await getNowPlaying([radio])).toEqual({
      service: "Radio",
      track: TRACK,
      progress: 12,
      playing: true,
    });
  });
});

describe("lastfm", () => {
  it("is attached only with a user and a key", () => {
    expect(lastfm({ user: "ada" }).attached).toBe(false);
    expect(lastfm({ user: "ada", apiKey: "k" }).attached).toBe(true);
  });

  it("maps the latest scrobble, with its length from track.getInfo", async () => {
    respond(
      {
        recenttracks: {
          track: [
            {
              name: "Song",
              artist: { "#text": "Band" },
              album: { "#text": "" },
              image: [
                { "#text": "s.jpg", size: "small" },
                { "#text": "xl.jpg", size: "extralarge" },
              ],
              "@attr": { nowplaying: "true" },
            },
          ],
        },
      },
      { track: { duration: "200000" } },
    );
    expect(await lastfm({ user: "ada", apiKey: "k" }).nowPlaying({})).toEqual({
      service: "Last.fm",
      playing: true,
      progress: 0,
      track: { ...TRACK, album: undefined, artwork: "xl.jpg" },
    });
  });
});
