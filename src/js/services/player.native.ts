// ======================================================================
// IMPORTS
// ======================================================================

import type { PlayerInitParams } from 'types/player';

// ======================================================================
// STATE
// ======================================================================

let playerElement: HTMLAudioElement | null = null;
// True from unload() or loadTrack() until loadstart fires for the new source.
// Suppresses stale error events that fire during source transitions.
let isResetting = false;
// True before the first loadTrack() and after unload().
// Guards unload() from doing unnecessary work when the player is already idle.
let needsReinit = true;

const airPlayCallbacks = new Set<(available: boolean) => void>();
let airPlayAvailable = false;

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
  console.log('%c--- .native - init ---', 'color:#4c3ad4');
  if (!playerElement) {
    playerElement = document.createElement('audio');
    playerElement.pause();
    playerElement.volume = volumeMuted ? 0 : volumeLevel / 100;
    playerElement.setAttribute('x-webkit-airplay', 'allow');
    playerElement.addEventListener('webkitplaybacktargetavailabilitychanged', (event: Event) => {
      airPlayAvailable = (event as any).availability === 'available';
      airPlayCallbacks.forEach((cb) => cb(airPlayAvailable));
    });
    playerElement.addEventListener('loadstart', () => {
      // New source is loading — clear the flag so subsequent errors are real.
      isResetting = false;
      onLoadStart();
    });
    playerElement.addEventListener('canplay', onCanPlay);
    playerElement.addEventListener('ended', onEnded);
    playerElement.addEventListener('error', (event: Event) => {
      if (isResetting) return;
      // Suppress MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) when src is empty — fired
      // after unload() clears the src. Not a genuine playback error.
      const el = playerElement!;
      if (el.error?.code === 4 /* MEDIA_ERR_SRC_NOT_SUPPORTED */ && !el.src) return;
      onError({ event, playerElement: el });
    });
  }
};

// ======================================================================
// UNLOAD
// ======================================================================

export const unload = (): void => {
  if (!playerElement || needsReinit) return;
  console.log('%c--- .native - unload ---', 'color:#4c3ad4');
  playerElement.pause();
  // Set before clearing src — suppresses any stale error from the previous
  // track's pending requests arriving mid-transition.
  isResetting = true;
  playerElement.src = '';
  playerElement.currentTime = 0;
  needsReinit = true;
  // Do NOT call load() — it fires loadstart then MEDIA_ERR_SRC_NOT_SUPPORTED
  // for the empty src, which would incorrectly trigger the error handler.
};

// ======================================================================
// LOAD TRACK
// ======================================================================

export const loadTrack = (trackSrc: string, progress: number = 0, play: boolean = true): void => {
  if (playerElement) {
    console.log('%c--- .native - loadTrack ---', 'color:#4c3ad4');
    isResetting = true;
    needsReinit = false;
    playerElement.src = trackSrc;
    playerElement.load();
    // isResetting cleared when loadstart fires
    if (progress) {
      playerElement.currentTime = progress / 1000;
    }
    if (play) {
      playerElement.play().catch((_error) => null);
    }
  }
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  if (playerElement) {
    playerElement.pause();
  }
};

export const resume = (): void => {
  if (playerElement) {
    playerElement.play().catch((_error) => null);
  }
};

export const restart = (): void => {
  if (playerElement) {
    playerElement.currentTime = 0;
    playerElement.play().catch((_error) => null);
  }
};

// ======================================================================
// VOLUME
// ======================================================================

export const setVolume = (volumeLevel: number): void => {
  if (playerElement) {
    playerElement.volume = volumeLevel / 100;
  }
};

// ======================================================================
// PROGRESS
// ======================================================================

export const setProgress = (progress: number): void => {
  if (playerElement) {
    playerElement.currentTime = progress / 1000;
  }
};

export const getCurrentProgress = (): number => {
  return playerElement?.currentTime || 0;
};

// ======================================================================
// PRELOADING STUBS
// [NOTE] Not currently used, but may be in future
// ======================================================================

// export const updateProgress = (): void => {
//   return;
// };

// export const preloadNextTrack = (): void => {
//   return;
// };

// export const setNextTrack = (): void => {
//   return;
// };

// export const clearNextTrack = (): void => {
//   return;
// };

// ======================================================================
// AIRPLAY
// ======================================================================

export const showAirPlayPicker = (): void => {
  (playerElement as any)?.webkitShowPlaybackTargetPicker?.();
};

export const subscribeAirPlayAvailability = (cb: (available: boolean) => void): void => {
  airPlayCallbacks.add(cb);
  cb(airPlayAvailable); // replay current state immediately
};

export const unsubscribeAirPlayAvailability = (cb: (available: boolean) => void): void => {
  airPlayCallbacks.delete(cb);
};
