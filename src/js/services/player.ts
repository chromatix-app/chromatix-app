// ======================================================================
// IMPORTS
// ======================================================================

import * as dashX from './player.dash';
import * as gaplessX from './player.gapless';
import * as nativeX from './player.native';
import type { GaplessInitParams, GaplessQueueEntry, GaplessQueueFlags, PlayerTrack } from 'types/player';
import requiresTranscoding from 'js/utils/requiresTranscoding';

// ======================================================================
// STATE
// ======================================================================

type ActivePlayer = 'native' | 'dash' | 'gapless';

let activePlayer: ActivePlayer = 'native';

// ======================================================================
// INITIALISE / UNLOAD
// ======================================================================

export const init = (params: GaplessInitParams): void => {
  // Each sub-player gets its own callback wrappers that only forward events
  // if that player is currently active. This prevents the inactive player's
  // stale events from affecting playback state (e.g. a spurious loadstart from
  // nativeX while the DASH player is active setting playerLoading unexpectedly).
  nativeX.init({
    ...params,
    onLoadStart: () => {
      if (activePlayer === 'native') params.onLoadStart();
    },
    onCanPlay: () => {
      if (activePlayer === 'native') params.onCanPlay();
    },
    onEnded: () => {
      if (activePlayer === 'native') params.onEnded();
    },
    onError: (e) => {
      if (activePlayer === 'native') params.onError(e);
      // else console.log('%c--- player - native error suppressed (dash is active) ---', 'color:#4c25b9', e);
    },
  });
  dashX.init({
    ...params,
    onLoadStart: () => {
      if (activePlayer === 'dash') params.onLoadStart();
    },
    onCanPlay: () => {
      if (activePlayer === 'dash') params.onCanPlay();
    },
    onEnded: () => {
      if (activePlayer === 'dash') params.onEnded();
    },
    onError: (e) => {
      if (activePlayer === 'dash') params.onError(e);
      // else console.log('%c--- player - dash error suppressed (native is active) ---', 'color:#4c25b9', e);
    },
  });
  gaplessX.init({
    ...params,
    onLoadStart: () => {
      if (activePlayer === 'gapless') params.onLoadStart();
    },
    onCanPlay: () => {
      if (activePlayer === 'gapless') params.onCanPlay();
    },
    onEnded: () => {
      if (activePlayer === 'gapless') params.onEnded();
    },
    onError: (e) => {
      if (activePlayer === 'gapless') params.onError(e);
    },
    // Gapless-specific callbacks always forward — they can only originate
    // from the gapless engine, and seam advances must reach the store even
    // during routing transitions.
  });
};

export const unload = (): void => {
  nativeX.unload();
  dashX.unload();
  gaplessX.unload();
  activePlayer = 'native';
};

// ======================================================================
// LOAD TRACK
// ======================================================================

/**
 * Load a track and start playback. Returns `false` if the player could not
 * load the track (e.g. a Plex DASH track whose credentials are not yet
 * available), so callers can surface an error state without needing to
 * replicate the routing logic.
 *
 * `queueIndex` is the track's position in the store's play queue — required
 * by the gapless engine to align its window with the store queue; the other
 * players ignore it.
 */
export const loadTrack = (
  track: PlayerTrack,
  progress: number = 0,
  play: boolean = true,
  queueIndex?: number
): boolean => {
  // Gapless engine first: it only accepts direct-playable tracks while the
  // gapless setting is enabled, and falls through otherwise.
  if (gaplessX.canPlay(track, queueIndex)) {
    nativeX.unload();
    dashX.unload();
    const loaded = gaplessX.loadTrack(track, progress, play, queueIndex);
    if (loaded) {
      activePlayer = 'gapless';
      return true;
    }
  }

  const transcoding = requiresTranscoding(track.codec);
  if (transcoding && track.dashSrc && dashX.isSupported()) {
    nativeX.unload();
    gaplessX.unload();
    dashX.loadTrack(track.dashSrc, progress, play);
    activePlayer = 'dash';
  } else if (transcoding && !track.dashSrc && track.trackKey && dashX.isSupported()) {
    // Plex track that needs DASH but dashSrc is unavailable — credentials not
    // ready yet. Leave both players idle; Resume will retry with a fresh URL.
    dashX.unload();
    nativeX.unload();
    gaplessX.unload();
    activePlayer = 'native';
    return false;
  } else {
    // Native path: either codec is supported, or the src URL already embeds
    // server-side transcoding (e.g. Jellyfin universal endpoint).
    dashX.unload();
    gaplessX.unload();
    nativeX.loadTrack(track.src, progress, play);
    activePlayer = 'native';
  }
  return true;
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  if (activePlayer === 'gapless') {
    gaplessX.pause();
  } else if (activePlayer === 'dash') {
    dashX.pause();
  } else {
    nativeX.pause();
  }
};

export const resume = (): void => {
  if (activePlayer === 'gapless') {
    gaplessX.resume();
  } else if (activePlayer === 'dash') {
    dashX.resume();
  } else {
    nativeX.resume();
  }
};

export const restart = (): void => {
  if (activePlayer === 'gapless') {
    gaplessX.restart();
  } else if (activePlayer === 'dash') {
    dashX.restart();
  } else {
    nativeX.restart();
  }
};

export const setProgress = (progress: number): void => {
  if (activePlayer === 'gapless') {
    gaplessX.setProgress(progress);
  } else if (activePlayer === 'dash') {
    dashX.setProgress(progress);
  } else {
    nativeX.setProgress(progress);
  }
};

export const getCurrentProgress = (): number => {
  if (activePlayer === 'gapless') {
    return gaplessX.getCurrentProgress();
  }
  if (activePlayer === 'dash') {
    return dashX.getCurrentProgress();
  }
  return nativeX.getCurrentProgress();
};

// ======================================================================
// VOLUME
// ======================================================================

export const setVolume = (volumeLevel: number): void => {
  // All players need to stay in sync so that switching between them
  // doesn't cause a volume change.
  nativeX.setVolume(volumeLevel);
  dashX.setVolume(volumeLevel);
  gaplessX.setVolume(volumeLevel);
};

// ======================================================================
// GAPLESS QUEUE
// ======================================================================

/** Enable/disable the gapless engine (Settings -> Playback). */
export const setGaplessEnabled = (value: boolean): void => {
  gaplessX.setEnabled(value);
  if (!value && activePlayer === 'gapless') {
    activePlayer = 'native';
  }
};

/** Whether the gapless engine is available on this platform at all. */
export const isGaplessSupported = (): boolean => {
  return gaplessX.isSupported();
};

/**
 * Mirror the store's play queue (in playback order) and repeat flags into
 * the gapless engine so it always preloads and schedules the correct next
 * track. Cheap when gapless is disabled.
 */
export const syncGaplessQueue = (entries: GaplessQueueEntry[], flags: GaplessQueueFlags): void => {
  gaplessX.syncQueue(entries, flags);
};

// ======================================================================
// DEBUGGING - BROWSER CONSOLE ACCESS
// ======================================================================

if (import.meta.env.VITE_ENV === 'local') {
  (window as any).__playerX = {
    getCurrentProgress,
    getActivePlayer: () => activePlayer,
  };
}
