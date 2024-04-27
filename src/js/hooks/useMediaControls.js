import { useEffect } from 'react';

const useMediaControls = (handlers) => {
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', handlers.play);
      navigator.mediaSession.setActionHandler('pause', handlers.pause);
      navigator.mediaSession.setActionHandler('seekbackward', handlers.prev);
      navigator.mediaSession.setActionHandler('seekforward', handlers.next);
      navigator.mediaSession.setActionHandler('previoustrack', handlers.prev);
      navigator.mediaSession.setActionHandler('nexttrack', handlers.next);
    }

    // cleanup
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [handlers]);

  return null;
};

export default useMediaControls;
