/** Parameters passed to each player's init() function. */
export interface PlayerInitParams {
  volumeLevel: number;
  volumeMuted: boolean;
  onLoadStart: () => void;
  onCanPlay: () => void;
  onEnded: () => void;
  onError: (params: { event: Event; playerElement: HTMLAudioElement }) => void;
}

/** Additional parameters passed to the gapless player's init() function. */
export interface GaplessInitParams extends PlayerInitParams {
  /**
   * Fired when the engine crosses a track boundary seamlessly. The store must
   * advance to the given queue position WITHOUT reloading the player — the
   * next track is already playing.
   */
  onGaplessSeamAdvance: (params: { index: number }) => void;
  /** Fired when the engine reports an unrecoverable track error. */
  onGaplessError: (params: { errorCode: string; errorMessage: string }) => void;
  /** Fired when the browser's autoplay policy blocks playback. */
  onGaplessPlayBlocked: () => void;
}

/**
 * The track shape consumed by the player services. A superset of the fields
 * every transposed track object (plexTranspose/jellyTranspose) provides.
 */
export interface PlayerTrack {
  src: string;
  /** Plex DASH manifest URL, computed on demand (see withDashSrc). */
  dashSrc?: string | null;
  codec?: string | null;
  trackKey?: string | null;
  title?: string;
  artist?: string;
  album?: string;
  thumbMd?: string | null;
  duration?: number;
}

/**
 * One entry of the gapless engine's queue mirror: enough of a track to build
 * the engine's playback window and media-session metadata, plus the queue
 * position it maps back to in the store.
 */
export interface GaplessQueueEntry {
  src: string;
  codec?: string | null;
  queueIndex: number;
  title?: string;
  artist?: string;
  album?: string;
  thumbMd?: string | null;
}

/** Repeat flags the gapless engine needs to predict the next track. */
export interface GaplessQueueFlags {
  repeatOnce: boolean;
  repeatAll: boolean;
}
