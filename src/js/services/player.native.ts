// ======================================================================
// OPTIONS
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';

const enablePreloading = isLocal;
const preloadAtTimeRemaining = 45000;
const preloadAtPercentage = 0.6;

// ======================================================================
// STATE
// ======================================================================

let nextTrackSrc: string | null = null;
let preloadedTrackSrc: string | null = null;
let isNextTrackPreloaded = false;

// ======================================================================
// TYPES
// ======================================================================

interface PlayerInitParams {
  volumeLevel: number;
  volumeMuted: boolean;
  onLoadStart: () => void;
  onCanPlay: () => void;
  onEnded: () => void;
  onError: (params: { event: Event; playerElement: HTMLAudioElement }) => void;
}

// ======================================================================
// INITIALISE
// ======================================================================

let playerElementA: HTMLAudioElement | null = null;
let playerElementB: HTMLAudioElement | null = null;
let currentPlayer: 'A' | 'B' = 'A';
let isPreloading = false;

export const init = ({
  volumeLevel,
  volumeMuted,
  onLoadStart,
  onCanPlay,
  onEnded,
  onError,
}: PlayerInitParams): void => {
  console.log('%c--- player - init ---', 'color:#a18507');
  if (!playerElementA) {
    playerElementA = document.createElement('audio');
    playerElementB = document.createElement('audio');

    setupPlayerElement(playerElementA, volumeLevel, volumeMuted, onLoadStart, onCanPlay, onEnded, onError);
    setupPlayerElement(playerElementB, volumeLevel, volumeMuted, onLoadStart, onCanPlay, onEnded, onError);
  }
};

const setupPlayerElement = (
  element: HTMLAudioElement,
  volumeLevel: number,
  volumeMuted: boolean,
  onLoadStart: () => void,
  onCanPlay: () => void,
  onEnded: () => void,
  onError: (params: { event: Event; playerElement: HTMLAudioElement }) => void
): void => {
  element.pause();
  element.volume = volumeMuted ? 0 : volumeLevel / 100;
  element.preload = 'auto';

  element.addEventListener('loadstart', () => {
    if (getCurrentPlayerElement() === element) onLoadStart();
  });
  element.addEventListener('canplay', () => {
    if (getCurrentPlayerElement() === element) onCanPlay();
  });
  element.addEventListener('ended', onEnded);
  element.addEventListener('error', (event: Event) => onError({ event, playerElement: element }));
};

const getCurrentPlayerElement = (): HTMLAudioElement | null => {
  return currentPlayer === 'A' ? playerElementA : playerElementB;
};

const getNextPlayerElement = (): HTMLAudioElement | null => {
  return currentPlayer === 'A' ? playerElementB : playerElementA;
};

const switchToNextPlayer = (): void => {
  currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
};

// ======================================================================
// VARIOUS PLAYER FUNCTIONS
// ======================================================================

export const unload = (): void => {
  console.log('%c--- player - unload ---', 'color:#a18507');
  if (playerElementA) {
    playerElementA.pause();
    playerElementA.src = '';
    playerElementA.load();
  }
  if (playerElementB) {
    playerElementB.pause();
    playerElementB.src = '';
    playerElementB.load();
  }
  // Reset preloading state
  isPreloading = false;
  isNextTrackPreloaded = false;
  nextTrackSrc = null;
  preloadedTrackSrc = null;
};

export const loadTrack = (trackSrc: string, progress: number = 0, play: boolean = true): void => {
  console.log('%c--- player - loadTrack ---', 'color:#a18507');

  // First, try to use preloaded track if it matches
  if (enablePreloading && isNextTrackPreloaded && nextTrackSrc === trackSrc && preloadedTrackSrc === trackSrc) {
    const success = switchToPreloadedTrack(progress, play);
    if (success) {
      console.log('%c--- player - used preloaded track ---', 'color:#a18507');
      return;
    }
  }

  // Fallback to regular loading
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    // Stop the other player if it's playing, and discard any in-flight preload
    const otherPlayer = getNextPlayerElement();
    if (otherPlayer) {
      otherPlayer.pause();
    }
    isPreloading = false;
    isNextTrackPreloaded = false;
    preloadedTrackSrc = null;

    currentPlayerElement.src = trackSrc;
    currentPlayerElement.load();
    if (progress) {
      currentPlayerElement.currentTime = progress / 1000;
    }
    if (play) {
      currentPlayerElement.play().catch((_error: any) => null);
    }
  }
};

export const preloadNextTrack = (trackSrc: string): void => {
  if (!enablePreloading) return;

  console.log('%c--- player - preloadNextTrack ---', 'color:#a18507');
  // console.log(trackSrc);

  const nextPlayerElement = getNextPlayerElement();
  if (nextPlayerElement && !isPreloading) {
    isPreloading = true;
    isNextTrackPreloaded = false;
    preloadedTrackSrc = trackSrc;
    nextPlayerElement.src = trackSrc;
    nextPlayerElement.preload = 'auto'; // Ensure aggressive preloading
    nextPlayerElement.load();

    // Capture src in closure so stale listeners from abandoned preloads are no-ops
    const capturedSrc = trackSrc;

    // Try to load enough data for smooth playback
    nextPlayerElement.addEventListener(
      'canplaythrough',
      () => {
        if (preloadedTrackSrc !== capturedSrc) return;
        isPreloading = false;
        isNextTrackPreloaded = true;
        console.log('%c--- player - next track fully preloaded ---', 'color:#a18507');
      },
      { once: true }
    );

    // Reset preloading flag on error so future preloads are not permanently blocked
    nextPlayerElement.addEventListener(
      'error',
      () => {
        if (preloadedTrackSrc !== capturedSrc) return;
        isPreloading = false;
        preloadedTrackSrc = null;
      },
      { once: true }
    );
  }
};

const switchToPreloadedTrack = (progress: number = 0, play: boolean = true): boolean => {
  console.log('%c--- player - switchToPreloadedTrack ---', 'color:#dac97f');
  const nextPlayerElement = getNextPlayerElement();
  if (nextPlayerElement && isNextTrackPreloaded && nextPlayerElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    // HAVE_FUTURE_DATA (3) - enough data to start playing
    // Pause current player immediately
    const currentPlayerElement = getCurrentPlayerElement();
    if (currentPlayerElement) {
      currentPlayerElement.pause();
    }

    // Switch to next player
    switchToNextPlayer();

    // Set up the new current player
    if (progress) {
      nextPlayerElement.currentTime = progress / 1000;
    }

    if (play) {
      nextPlayerElement.play().catch((_error: any) => null);
    }

    // Reset preloading state
    isNextTrackPreloaded = false;
    nextTrackSrc = null;
    preloadedTrackSrc = null;

    console.log('%c--- player - switched to preloaded track ---', 'color:#dac97f');
    return true;
  }

  console.log('%c--- player - preloaded track not ready, falling back ---', 'color:#dac97f');
  return false;
};

export const pause = (): void => {
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    currentPlayerElement.pause();
  }
};

export const resume = (): void => {
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    currentPlayerElement.play().catch((_error: any) => null);
  }
};

export const restart = (): void => {
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    currentPlayerElement.currentTime = 0;
    currentPlayerElement.play().catch((_error: any) => null);
  }
};

export const setVolume = (volumeLevel: number): void => {
  // console.log('%c--- player - setVolume - ' + volumeLevel + ' ---', 'color:#a18507');
  const volume = volumeLevel / 100;
  if (playerElementA) {
    playerElementA.volume = volume;
  }
  if (playerElementB) {
    playerElementB.volume = volume;
  }
};

export const setProgress = (progress: number): void => {
  // console.log('%c--- player - setProgress - ' + progress / 1000 + ' ---', 'color:#a18507');
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    currentPlayerElement.currentTime = progress / 1000;
  }
};

export const getCurrentProgress = (): number => {
  const currentPlayerElement = getCurrentPlayerElement();
  return currentPlayerElement?.currentTime || 0;
};

export const getCurrentDuration = (): number => {
  const currentPlayerElement = getCurrentPlayerElement();
  return currentPlayerElement?.duration || 0;
};

// ======================================================================
// PRELOADING LOGIC
// ======================================================================

// Listen to track progress and preload the next track when we're within 45 seconds
// of the end, or at 60% progress, whichever comes first
export const updateProgress = (currentProgress: number): void => {
  if (!enablePreloading || !nextTrackSrc || isNextTrackPreloaded || isPreloading) return;

  const currentDuration = getCurrentDuration() * 1000; // Convert to milliseconds
  if (currentDuration <= 0) return;

  const timeRemaining = currentDuration - currentProgress;
  const progressPercentage = currentProgress / currentDuration;

  if (timeRemaining <= preloadAtTimeRemaining || progressPercentage >= preloadAtPercentage) {
    console.log('%c--- player - auto-preloading next track ---', 'color:#a18507');
    preloadNextTrack(nextTrackSrc);
  }
};

export const setNextTrack = (trackSrc: string | null): void => {
  console.log('%c--- player - setNextTrack ---', 'color:#dac97f');
  nextTrackSrc = trackSrc;
  isNextTrackPreloaded = false;
  isPreloading = false;
  preloadedTrackSrc = null;
};

export const clearNextTrack = (): void => {
  console.log('%c--- player - clearNextTrack ---', 'color:#dac97f');
  nextTrackSrc = null;
  isNextTrackPreloaded = false;
  isPreloading = false;
  preloadedTrackSrc = null;
};
