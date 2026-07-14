// ======================================================================
// IMPORTS
// ======================================================================

import * as castX from './player.cast';
import * as dashX from './player.dash';
import * as nativeX from './player.native';
import type { CastInitParams, PlayerTrack } from 'types/player';
import requiresTranscoding from 'js/utils/requiresTranscoding';

// ======================================================================
// STATE
// ======================================================================

type ActivePlayer = 'native' | 'dash' | 'cast';

let activePlayer: ActivePlayer = 'native';

// ======================================================================
// INITIALISE / UNLOAD
// ======================================================================

export const init = (params: CastInitParams): void => {
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
  castX.init({
    ...params,
    onLoadStart: () => {
      if (activePlayer === 'cast') params.onLoadStart();
    },
    onCanPlay: () => {
      if (activePlayer === 'cast') params.onCanPlay();
    },
    onEnded: () => {
      if (activePlayer === 'cast') params.onEnded();
    },
    onError: (e) => {
      if (activePlayer === 'cast') params.onError(e);
    },
    // Session lifecycle callbacks always forward — they fire while another
    // player is still active (that's the point of a handoff).
  });
};

export const unload = (): void => {
  nativeX.unload();
  dashX.unload();
  castX.unload();
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
  // When a cast session is active, all playback happens on the cast device
  // and the local players stay idle.
  if (castX.isConnected()) {
    nativeX.unload();
    dashX.unload();
    const loaded = castX.loadTrack(track, progress, play);
    activePlayer = 'cast';
    return loaded;
  }

  const transcoding = requiresTranscoding(track.codec);
  if (transcoding && track.dashSrc && dashX.isSupported()) {
    nativeX.unload();
    castX.unload();
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
    castX.unload();
    nativeX.loadTrack(track.src, progress, play);
    activePlayer = 'native';
  }
  return true;
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  if (activePlayer === 'cast') {
    castX.pause();
  } else if (activePlayer === 'dash') {
    dashX.pause();
  } else {
    nativeX.pause();
  }
};

export const resume = (): void => {
  if (activePlayer === 'cast') {
    castX.resume();
  } else if (activePlayer === 'dash') {
    dashX.resume();
  } else {
    nativeX.resume();
  }
};

export const restart = (): void => {
  if (activePlayer === 'cast') {
    castX.restart();
  } else if (activePlayer === 'dash') {
    dashX.restart();
  } else {
    nativeX.restart();
  }
};

export const setProgress = (progress: number): void => {
  if (activePlayer === 'cast') {
    castX.setProgress(progress);
  } else if (activePlayer === 'dash') {
    dashX.setProgress(progress);
  } else {
    nativeX.setProgress(progress);
  }
};

export const getCurrentProgress = (): number => {
  if (activePlayer === 'cast') {
    return castX.getCurrentProgress();
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
  // Both local players need to stay in sync so that switching between them
  // doesn't cause a volume change.
  nativeX.setVolume(volumeLevel);
  dashX.setVolume(volumeLevel);
  // While casting, the volume slider controls the cast device instead.
  if (castX.isConnected()) {
    castX.setVolume(volumeLevel);
  }
};

// ======================================================================
// CASTING
// ======================================================================

/**
 * Align routing with the cast session state without loading a track.
 * Called by the store when a session starts (local players go idle and all
 * subsequent commands go to the cast device) and when it ends (routing
 * returns to the local players). Load-based routing in loadTrack() handles
 * the rest.
 */
export const syncCastRouting = (): void => {
  if (castX.isConnected() && activePlayer !== 'cast') {
    nativeX.unload();
    dashX.unload();
    activePlayer = 'cast';
  } else if (!castX.isConnected() && activePlayer === 'cast') {
    activePlayer = 'native';
  }
};

/** Open the cast device picker (or the stop-casting dialog when connected). */
export const requestCastSession = (): void => {
  castX.requestCastSession();
};

/** End the current cast session (used on logout). */
export const endCastSession = (): void => {
  castX.endCastSession();
};

export const isCastConnected = (): boolean => {
  return castX.isConnected();
};

/** True when a connected cast receiver already has media loaded. */
export const isCastMediaLoaded = (): boolean => {
  return castX.isMediaLoaded();
};

/** The cast receiver's current volume (0-100), or null when not casting. */
export const getCastVolume = (): number | null => {
  return castX.getVolume();
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
    isCastConnected,
  };
}
