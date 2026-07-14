/** Parameters passed to each player's init() function. */
export interface PlayerInitParams {
  volumeLevel: number;
  volumeMuted: boolean;
  onLoadStart: () => void;
  onCanPlay: () => void;
  onEnded: () => void;
  onError: (params: { event: Event; playerElement: HTMLAudioElement }) => void;
}

/** Additional parameters passed to the cast player's init() function. */
export interface CastInitParams extends PlayerInitParams {
  /** Fired when cast devices appear on / disappear from the network. */
  onCastAvailability: (available: boolean) => void;
  /** Fired when a cast session starts or is rejoined after a page reload. */
  onCastConnect: (params: {
    deviceName: string | null;
    deviceVolume: number | null;
    wasResumed: boolean;
    remoteIsPaused: boolean;
    remoteMediaLoaded: boolean;
  }) => void;
  /** Fired when the cast session ends; progress is the last known position in ms. */
  onCastDisconnect: (params: { progress: number }) => void;
  /** Fired when playback is paused/resumed remotely (e.g. via the Google Home app). */
  onCastRemotePause: (isPaused: boolean) => void;
  /** Fired when the receiver volume changes; volumeLevel is 0-100. */
  onCastVolumeChange: (volumeLevel: number) => void;
  /** Fired when the cast media session reports a playback error. */
  onCastError: (params: { errorCode: string; errorMessage: string }) => void;
}

/**
 * The track shape consumed by the player services. A superset of the fields
 * every transposed track object (plexTranspose/jellyTranspose) provides —
 * playback needs the sources and codec, casting additionally uses the
 * metadata fields to populate the receiver's media session.
 */
export interface PlayerTrack {
  src: string;
  /** Plex DASH manifest URL, computed on demand (see withDashSrc). */
  dashSrc?: string | null;
  /** Server-side transcode URL used when a Chromecast can't direct play the codec (see withCastSrc). */
  castSrc?: string | null;
  codec?: string | null;
  trackKey?: string | null;
  title?: string;
  artist?: string;
  album?: string;
  trackNumber?: number;
  discNumber?: number;
  releaseDate?: string | null;
  thumbMd?: string | null;
  duration?: number;
}
