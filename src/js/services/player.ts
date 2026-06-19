// ======================================================================
// IMPORTS
// ======================================================================

import * as dashX from './player.dash';
import * as nativeX from './player.native';
import type { PlayerInitParams } from 'types/player';
import requiresTranscoding from 'js/utils/requiresTranscoding';

// ======================================================================
// TYPES
// ======================================================================

/** Minimal track shape required by the player router. */
interface PlayerTrack {
  src: string;
  dashSrc?: string | null;
  codec?: string | null;
  trackKey?: string | null;
}

// ======================================================================
// STATE
// ======================================================================

type ActivePlayer = 'native' | 'dash';

let activePlayer: ActivePlayer = 'native';

// ======================================================================
// INITIALISE / UNLOAD
// ======================================================================

export const init = (params: PlayerInitParams): void => {
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
};

export const unload = (): void => {
  nativeX.unload();
  dashX.unload();
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
 */
export const loadTrack = (track: PlayerTrack, progress: number = 0, play: boolean = true): boolean => {
  const transcoding = requiresTranscoding(track.codec);
  if (transcoding && track.dashSrc && dashX.isSupported()) {
    nativeX.unload();
    dashX.loadTrack(track.dashSrc, progress, play);
    activePlayer = 'dash';
  } else if (transcoding && !track.dashSrc && track.trackKey && dashX.isSupported()) {
    // Plex track that needs DASH but dashSrc is unavailable — credentials not
    // ready yet. Leave both players idle; Resume will retry with a fresh URL.
    dashX.unload();
    nativeX.unload();
    activePlayer = 'native';
    return false;
  } else {
    // Native path: either codec is supported, or the src URL already embeds
    // server-side transcoding (e.g. Jellyfin universal endpoint).
    dashX.unload();
    nativeX.loadTrack(track.src, progress, play);
    activePlayer = 'native';
  }
  return true;
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  if (activePlayer === 'dash') {
    dashX.pause();
  } else {
    nativeX.pause();
  }
};

export const resume = (): void => {
  if (activePlayer === 'dash') {
    dashX.resume();
  } else {
    nativeX.resume();
  }
};

export const restart = (): void => {
  if (activePlayer === 'dash') {
    dashX.restart();
  } else {
    nativeX.restart();
  }
};

export const setProgress = (progress: number): void => {
  if (activePlayer === 'dash') {
    dashX.setProgress(progress);
  } else {
    nativeX.setProgress(progress);
  }
};

export const getCurrentProgress = (): number => {
  if (activePlayer === 'dash') {
    return dashX.getCurrentProgress();
  }
  return nativeX.getCurrentProgress();
};

// ======================================================================
// VOLUME
// ======================================================================

export const setVolume = (volumeLevel: number): void => {
  // Both players need to stay in sync so that switching between them
  // doesn't cause a volume change.
  nativeX.setVolume(volumeLevel);
  dashX.setVolume(volumeLevel);
};

// ======================================================================
// PRELOADING STUBS
// [NOTE] Not currently used, but may be in future
// ======================================================================

// // Listen to track progress and preload the next track when we're within 45 seconds
// // of the end, or at 60% progress, whichever comes first
// export const updateProgress = (_currentProgress: number): void => {
//   return;
// };

// export const preloadNextTrack = (_trackSrc: string): void => {
//   return;
// };

// export const setNextTrack = (_track: PlayerTrack | null): void => {
//   return;
// };

// export const clearNextTrack = (): void => {
//   return;
// };

// ======================================================================
// DEBUGGING - BROWSER CONSOLE ACCESS
// ======================================================================

if (import.meta.env.VITE_ENV === 'local') {
  (window as any).__playerX = {
    getCurrentProgress,
    getActivePlayer: () => activePlayer,
  };
}
