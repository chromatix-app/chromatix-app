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
    playerElement.addEventListener('error', (event) => onError({ event, playerElement: playerElement! }));
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
  // console.log('%c--- player - setVolume - ' + volumeLevel + ' ---', 'color:#a18507');
  if (playerElement) {
    playerElement.volume = volumeLevel / 100;
  }
};

export const setProgress = (progress: number): void => {
  // console.log('%c--- player - setProgress - ' + progress / 1000 + ' ---', 'color:#a18507');
  if (playerElement) {
    playerElement.currentTime = progress / 1000;
  }
};

export const getCurrentProgress = (): number => {
  return playerElement?.currentTime || 0;
};
