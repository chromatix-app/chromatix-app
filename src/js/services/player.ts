// ======================================================================
// OPTIONS
// ======================================================================

const enablePreloading = true;

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

  element.addEventListener('loadstart', onLoadStart);
  element.addEventListener('canplay', onCanPlay);
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
};

export const loadTrack = (trackSrc: string, progress: number = 0, play: boolean = true): void => {
  console.log('%c--- player - loadTrack ---', 'color:#a18507');
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    // Stop the other player if it's playing
    const otherPlayer = getNextPlayerElement();
    if (otherPlayer) {
      otherPlayer.pause();
    }

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
  console.log('%c--- player - preloadNextTrack ---', 'color:#a18507');

  if (!enablePreloading) {
    console.log('%c--- player - preloading disabled ---', 'color:#a18507');
    return;
  }

  const nextPlayerElement = getNextPlayerElement();
  if (nextPlayerElement && !isPreloading) {
    isPreloading = true;
    nextPlayerElement.src = trackSrc;
    nextPlayerElement.preload = 'auto'; // Ensure aggressive preloading
    nextPlayerElement.load();

    // Try to load enough data for smooth playback
    nextPlayerElement.addEventListener(
      'canplaythrough', // Wait for enough data to play through
      () => {
        isPreloading = false;
        console.log('%c--- player - next track fully preloaded ---', 'color:#a18507');
      },
      { once: true }
    );

    // Fallback in case canplaythrough doesn't fire
    nextPlayerElement.addEventListener(
      'canplay',
      () => {
        if (isPreloading) {
          setTimeout(() => {
            isPreloading = false;
          }, 500); // Small delay to ensure more data is buffered
        }
      },
      { once: true }
    );
  }
};

export const switchToPreloadedTrack = (progress: number = 0, play: boolean = true): boolean => {
  console.log('%c--- player - switchToPreloadedTrack ---', 'color:#a18507');
  const nextPlayerElement = getNextPlayerElement();
  if (nextPlayerElement && nextPlayerElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
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
      // Use requestAnimationFrame for smoother timing
      requestAnimationFrame(() => {
        nextPlayerElement.play().catch((_error: any) => null);
      });
    }

    console.log('%c--- player - switched to preloaded track ---', 'color:#a18507');
    return true;
  }

  console.log('%c--- player - preloaded track not ready, falling back ---', 'color:#a18507');
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

export const loadTrackOnNextElement = (trackSrc: string, progress: number = 0, play: boolean = true): void => {
  console.log('%c--- player - loadTrackOnNextElement ---', 'color:#a18507');

  // Stop current player
  const currentPlayerElement = getCurrentPlayerElement();
  if (currentPlayerElement) {
    currentPlayerElement.pause();
  }

  // Switch to next element
  switchToNextPlayer();

  // Load track on the new current element
  const newCurrentElement = getCurrentPlayerElement();
  if (newCurrentElement) {
    newCurrentElement.src = trackSrc;
    newCurrentElement.load();
    if (progress) {
      newCurrentElement.currentTime = progress / 1000;
    }
    if (play) {
      newCurrentElement.play().catch((_error: any) => null);
    }
  }
};
