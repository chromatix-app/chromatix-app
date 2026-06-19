import { useEffect } from 'react';
import { useSelector } from 'react-redux';

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

const useKeyMediaControls = (handlers: MediaControlHandlers): null => {
  const keyboardMediaKeys = useSelector(
    ({ sessionModel }: { sessionModel: { keyboardMediaKeys: boolean } }) => sessionModel.keyboardMediaKeys
  );

  const noop = (): void => {};

  useEffect(() => {
    if ('mediaSession' in navigator) {
      // When disabled, register no-ops instead of null — passing null removes the custom handler
      // and falls back to the browser's default behaviour (directly controlling the audio element)
      navigator.mediaSession.setActionHandler('play', keyboardMediaKeys ? handlers.play : noop);
      navigator.mediaSession.setActionHandler('pause', keyboardMediaKeys ? handlers.pause : noop);
      navigator.mediaSession.setActionHandler('seekbackward', keyboardMediaKeys ? handlers.prev : noop);
      navigator.mediaSession.setActionHandler('seekforward', keyboardMediaKeys ? handlers.next : noop);
      navigator.mediaSession.setActionHandler('previoustrack', keyboardMediaKeys ? handlers.prev : noop);
      navigator.mediaSession.setActionHandler('nexttrack', keyboardMediaKeys ? handlers.next : noop);
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
  }, [handlers, keyboardMediaKeys]);

  return null;
};

export default useKeyMediaControls;
