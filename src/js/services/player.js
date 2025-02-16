let playerElement = null;

export const init = (playerVolume, playerMuted, onLoadStart, onCanPlay, onEnded) => {
  console.log('%c--- player - init ---', 'color:#a18507');
  if (!playerElement) {
    playerElement = document.createElement('audio');

    playerElement.volume = playerMuted ? 0 : playerVolume;

    playerElement.addEventListener('loadstart', onLoadStart);
    playerElement.addEventListener('canplay', onCanPlay);
    playerElement.addEventListener('ended', onEnded);
  }
};

export const unload = () => {
  console.log('%c--- player - unload ---', 'color:#a18507');
  playerElement.pause();
  playerElement.src = '';
  playerElement.load();
};

export const loadTrack = (trackSrc, progress = 0, play = true) => {
  console.log('%c--- player - loadTrack ---', 'color:#a18507');
  playerElement.src = trackSrc;
  playerElement.load();
  if (progress) {
    playerElement.currentTime = progress / 1000;
  }
  if (play) {
    playerElement.play().catch((error) => null);
  }
};

export const pause = () => {
  playerElement.pause();
};

export const resume = () => {
  playerElement.play().catch((error) => null);
};

export const restart = () => {
  playerElement.currentTime = 0;
  playerElement.play().catch((error) => null);
};

export const setVolume = (volume) => {
  // console.log('%c--- player - setVolume - ' + volume + ' ---', 'color:#a18507');
  playerElement.volume = volume / 100;
};

export const setProgress = (progress) => {
  console.log('%c--- player - setProgress - ' + progress / 1000 + ' ---', 'color:#a18507');
  playerElement.currentTime = progress / 1000;
};

export const getCurrentProgress = () => {
  return playerElement?.currentTime || 0;
};
