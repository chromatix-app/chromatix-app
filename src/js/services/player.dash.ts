// ======================================================================
// IMPORTS
// ======================================================================

import * as dashjs from 'dashjs';
import type { PlayerInitParams } from 'types/player';

// ======================================================================
// STATE
// ======================================================================

let audioElement: HTMLAudioElement | null = null;
let mediaPlayer: dashjs.MediaPlayerClass | null = null;
// False until init() completes — guards all methods that require MediaSource.
let supported = false;
// True from unload() or loadTrack() until loadstart fires for the new source.
// Suppresses spurious error events that fire during source transitions.
let isResetting = false;
// True before the first loadTrack() and after any reset() from unload().
// initialize() must be called (not attachSource()) when this flag is set.
let needsReinit = true;

// ======================================================================
// HELPERS
// ======================================================================

const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

// ======================================================================
// INITIALISE
// ======================================================================

export const init = ({
  volumeLevel,
  volumeMuted,
  onLoadStart,
  onCanPlay,
  onEnded,
  onError,
}: PlayerInitParams): void => {
  if (!window.MediaSource) {
    console.warn('%c--- .dash - MediaSource API not available; DASH playback disabled ---', 'color:#2f67d0');
    return;
  }

  if (audioElement) return; // Already initialised

  supported = true;
  console.log('%c--- .dash - init ---', 'color:#2f67d0');

  audioElement = document.createElement('audio');
  audioElement.volume = volumeMuted ? 0 : volumeLevel / 100;
  audioElement.addEventListener('loadstart', () => {
    // New source is loading — clear the flag so subsequent errors are real.
    isResetting = false;
    onLoadStart();
  });
  audioElement.addEventListener('canplay', onCanPlay);
  audioElement.addEventListener('ended', onEnded);
  audioElement.addEventListener('error', (event: Event) => {
    if (isResetting) return;
    // Suppress MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) when src is empty — this is
    // a dash.js artifact. Real DASH failures come through the dash.js ERROR event.
    const el = audioElement!;
    if (el.error?.code === 4 /* MEDIA_ERR_SRC_NOT_SUPPORTED */ && !el.src) return;
    onError({ event, playerElement: el });
  });

  mediaPlayer = dashjs.MediaPlayer().create();
  mediaPlayer.updateSettings({
    debug: {
      logLevel: dashjs.Debug.LOG_LEVEL_NONE as dashjs.LogLevel,
    },
  });
  mediaPlayer.on(dashjs.MediaPlayer.events.ERROR, (e) => {
    console.error('%c--- .dash - dash.js error ---', 'color:#f00', e);
  });
  // Do not call initialize() here — deferred to the first loadTrack() so the
  // audio element and source are attached in a single operation.
};

// ======================================================================
// UNLOAD
// ======================================================================

export const unload = (): void => {
  if (!mediaPlayer || !audioElement || !supported) return;
  // Calling reset() before initialize() throws "MediaPlayer not initialized!" — skip if idle.
  if (needsReinit) return;
  // reset() stops all network activity and detaches the audio element.
  // Do NOT call initialize() here — it fires a spurious loadstart that would
  // set playerTrackLoaded=true for a non-existent track.
  console.log('%c--- .dash - unload ---', 'color:#2f67d0');
  isResetting = true;
  mediaPlayer.reset();
  needsReinit = true;
};

// ======================================================================
// LOAD TRACK
// ======================================================================

export const loadTrack = (dashSrc: string, progress: number = 0, play: boolean = true): void => {
  if (!mediaPlayer || !audioElement || !supported) return;

  const sessionId = generateSessionId();
  const manifestUrl = `${dashSrc}&X-Plex-Session-Identifier=${encodeURIComponent(sessionId)}`;
  const startTime = progress > 0 ? progress / 1000 : undefined;

  isResetting = true;

  console.log('%c--- .dash - loadTrack ---', 'color:#2f67d0');

  if (needsReinit) {
    // First load (or after reset) — initialize() re-attaches the audio element.
    mediaPlayer.initialize(audioElement, manifestUrl, false, startTime);
    needsReinit = false;
  } else {
    // Subsequent loads — attachSource() is safer than reset()+initialize() in the
    // same call stack, which can silently fail in dash.js 5.x.
    mediaPlayer.attachSource(manifestUrl, startTime);
  }

  // Call play() synchronously — dash.js's autoPlay invokes it after async manifest
  // fetch, by which point the browser's user-gesture context may have expired.
  if (play) {
    audioElement.play().catch((_e) => null);
  }
  // isResetting cleared when loadstart fires
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  if (mediaPlayer && supported) {
    mediaPlayer.pause();
  }
};

export const resume = (): void => {
  if (mediaPlayer && supported) {
    mediaPlayer.play();
  }
};

export const restart = (): void => {
  if (mediaPlayer && supported) {
    mediaPlayer.seek(0);
    mediaPlayer.play();
  }
};

// ======================================================================
// VOLUME
// ======================================================================

export const setVolume = (volumeLevel: number): void => {
  if (audioElement) {
    audioElement.volume = volumeLevel / 100;
  }
};

// ======================================================================
// PROGRESS
// ======================================================================

export const setProgress = (progress: number): void => {
  if (mediaPlayer && supported) {
    mediaPlayer.seek(progress / 1000);
  }
};

export const getCurrentProgress = (): number => {
  // Use audioElement.currentTime directly — mediaPlayer.time() throws
  // PLAYBACK_NOT_INITIALIZED_ERROR when the player is not yet initialized.
  return audioElement?.currentTime || 0;
};

// ======================================================================
// PRELOADING STUBS
// Not currently used, but may be in future
// ======================================================================

export const updateProgress = (_currentProgress: number): void => {
  return;
};

export const preloadNextTrack = (_trackSrc: string): void => {
  return;
};

export const setNextTrack = (_trackSrc: string | null): void => {
  return;
};

export const clearNextTrack = (): void => {
  return;
};

// ======================================================================
// HELPERS
// ======================================================================

export const isSupported = (): boolean => supported;
