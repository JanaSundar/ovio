import "server-only";

import type { Track } from "@/components/ovio/now-playing/now-playing";
import { fetchJson, fetchOk, type FetchOptions, type RequestOptions } from "@/lib/ovio-fetch";

/**
 * Server-side "now playing" for <NowPlaying />, from any music service. A service is a name, whether
 * its credentials are set, and how to ask it what's playing; Last.fm and Spotify come ready-made,
 * and musicService() adapts any JSON API.
 */

/** What a service is playing, or played last. Progress is in seconds. */
export type NowPlaying = { service: string; track: Track; progress: number; playing: boolean };

export type MusicService = {
  name: string;
  /** False until its credentials are set; getNowPlaying skips it then. */
  attached: boolean;
  nowPlaying: (options: FetchOptions) => Promise<NowPlaying | null>;
};

/** Now playing changes by the minute, so it's cached for 30 seconds unless you say otherwise. */
const NOW = { revalidate: 30 };

/**
 * Asks each attached service in turn and returns the first answer: the track playing, or the
 * last one played. Throws when none is attached, so a page can fall back to sample data.
 */
export async function getNowPlaying(
  services: MusicService[],
  options: FetchOptions = NOW,
): Promise<NowPlaying | null> {
  const attached = services.filter((s) => s.attached);
  if (!attached.length)
    throw new Error(
      `No music service attached: set credentials for ${services.map((s) => s.name).join(" or ")}`,
    );
  for (const service of attached) {
    const now = await service.nowPlaying(options);
    if (now) return now;
  }
  return null;
}

/**
 * Any JSON API as a music service: `map` turns its response into what's playing, or null.
 * `attached` defaults to true; pass false when its key is missing.
 */
export function musicService<T>({
  name,
  url,
  init,
  attached = true,
  map,
}: {
  name: string;
  url: string;
  init?: RequestOptions;
  attached?: boolean;
  map: (json: T) => Omit<NowPlaying, "service"> | null;
}): MusicService {
  return {
    name,
    attached,
    nowPlaying: async (options) => {
      const now = map(await fetchJson<T>(url, options, init));
      return now && { service: name, ...now };
    },
  };
}

type LastfmImage = { "#text": string; size: string };
type LastfmRecent = {
  recenttracks?: {
    track: {
      name: string;
      artist: { "#text": string };
      album: { "#text": string };
      image?: LastfmImage[];
      "@attr"?: { nowplaying?: string };
    }[];
  };
};
type LastfmInfo = { track?: { duration?: string } };

/** Last.fm doesn't know every track's length; this stands in when it doesn't. */
const UNKNOWN_LENGTH = 210;

/**
 * Last.fm's latest scrobble, which is what's playing when the user is listening. Needs an API key
 * (last.fm/api) and the username: LASTFM_API_KEY and LASTFM_USER, or pass them.
 */
export function lastfm({
  user = process.env.LASTFM_USER,
  apiKey = process.env.LASTFM_API_KEY,
}: { user?: string; apiKey?: string } = {}): MusicService {
  const api = (method: string, params: Record<string, string>) =>
    `https://ws.audioscrobbler.com/2.0/?${new URLSearchParams({ method, api_key: apiKey ?? "", format: "json", ...params })}`;
  return {
    name: "Last.fm",
    attached: Boolean(user && apiKey),
    nowPlaying: async (options) => {
      const { recenttracks } = await fetchJson<LastfmRecent>(
        api("user.getrecenttracks", { user: user!, limit: "1" }),
        options,
      );
      const t = recenttracks?.track[0];
      if (!t) return null;
      const artist = t.artist["#text"];
      const info = await fetchJson<LastfmInfo>(
        api("track.getInfo", { artist, track: t.name }),
        options,
      ).catch(() => null);
      const length = Math.round(Number(info?.track?.duration ?? 0) / 1000);
      return {
        service: "Last.fm",
        playing: t["@attr"]?.nowplaying === "true",
        progress: 0,
        track: {
          title: t.name,
          artist,
          album: t.album["#text"] || undefined,
          duration: length || UNKNOWN_LENGTH,
          artwork: t.image?.at(-1)?.["#text"] || undefined,
        },
      };
    },
  };
}

type SpotifyTrack = {
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
};
type SpotifyCurrent = {
  is_playing: boolean;
  progress_ms: number | null;
  item: SpotifyTrack | null;
};
type SpotifyRecent = { items: { track: SpotifyTrack }[] };

const fromSpotify = (t: SpotifyTrack) => ({
  title: t.name,
  artist: t.artists.map((a) => a.name).join(", "),
  album: t.album.name,
  duration: Math.round(t.duration_ms / 1000),
  artwork: t.album.images[0]?.url,
});

/**
 * Spotify's player: the current track, or the last one played. Needs an app's client id and secret
 * and a refresh token with the user-read-currently-playing and user-read-recently-played scopes:
 * SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN, or pass them.
 */
export function spotify({
  clientId = process.env.SPOTIFY_CLIENT_ID,
  clientSecret = process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken = process.env.SPOTIFY_REFRESH_TOKEN,
}: { clientId?: string; clientSecret?: string; refreshToken?: string } = {}): MusicService {
  return {
    name: "Spotify",
    attached: Boolean(clientId && clientSecret && refreshToken),
    nowPlaying: async (options) => {
      // Access tokens last an hour; caching one for 50 minutes spares a request per refresh.
      const { access_token } = await fetchJson<{ access_token: string }>(
        "https://accounts.spotify.com/api/token",
        { ...options, revalidate: 3000 },
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken!,
          }).toString(),
        },
      );
      const headers = { Authorization: `Bearer ${access_token}` };
      const api = "https://api.spotify.com/v1/me/player";
      // 204 means nothing is playing.
      const res = await fetchOk(`${api}/currently-playing`, options, { headers });
      const current = res.status === 204 ? null : ((await res.json()) as SpotifyCurrent);
      if (current?.item)
        return {
          service: "Spotify",
          playing: current.is_playing,
          progress: Math.round((current.progress_ms ?? 0) / 1000),
          track: fromSpotify(current.item),
        };
      const recent = await fetchJson<SpotifyRecent>(`${api}/recently-played?limit=1`, options, {
        headers,
      });
      const last = recent.items[0]?.track;
      return last
        ? { service: "Spotify", playing: false, progress: 0, track: fromSpotify(last) }
        : null;
    },
  };
}
