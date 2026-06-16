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

let playerElement: HTMLAudioElement | null = null;

export const init = ({
  volumeLevel,
  volumeMuted,
  onLoadStart,
  onCanPlay,
  onEnded,
  onError,
}: PlayerInitParams): void => {
  console.log('%c--- player - init ---', 'color:#a18507');
  if (!playerElement) {
    playerElement = document.createElement('audio');
    playerElement.pause();
    playerElement.volume = volumeMuted ? 0 : volumeLevel / 100;
    playerElement.addEventListener('loadstart', onLoadStart);
    playerElement.addEventListener('canplay', onCanPlay);
    playerElement.addEventListener('ended', onEnded);
    playerElement.addEventListener('error', (event: Event) => onError({ event, playerElement: playerElement! }));
  }
};

// ======================================================================
// VARIOUS PLAYER FUNCTIONS
// ======================================================================

export const unload = (): void => {
  console.log('%c--- player - unload ---', 'color:#a18507');
  if (playerElement) {
    playerElement.pause();
    playerElement.src = '';
    playerElement.load();
  }
};

export const loadTrack = (trackSrc: string, progress: number = 0, play: boolean = true): void => {
  // console.log('%c--- player - loadTrack ---', 'color:#a18507');
  if (playerElement) {
    playerElement.src = trackSrc;
    playerElement.load();
    if (progress) {
      playerElement.currentTime = progress / 1000;
    }
    if (play) {
      playerElement.play().catch((_error) => null);
    }
  }
};

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

export const setVolume = (volumeLevel: number): void => {
  if (playerElement) {
    playerElement.volume = volumeLevel / 100;
  }
};

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
// ======================================================================

export const preloadNextTrack = (_trackSrc: string): void => {
  return;
};

// Listen to track progress and preload the next track when we're within 45 seconds
// of the end, or at 60% progress, whichever comes first
export const updateProgress = (_currentProgress: number): void => {
  return;
};

export const setNextTrack = (_trackSrc: string | null): void => {
  return;
};

export const clearNextTrack = (): void => {
  return;
};
