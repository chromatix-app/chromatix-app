import { useEffect } from 'react';

interface MediaControlHandlers {
  play: () => void;
  pause: () => void;
  prev: () => void;
  next: () => void;
}

/**
 * Custom hook that sets up media control handlers for the browser's Media Session API.
 * Enables media controls in notifications, lock screens, and media control centers.
 * @param handlers - Object containing media control handler functions
 */

const useMediaControls = (handlers: MediaControlHandlers): null => {
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
