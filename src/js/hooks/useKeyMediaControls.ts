import { useEffect } from 'react';

interface KeyMediaControlHandlers {
  playPause: () => void;
  prev: () => void;
  next: () => void;
}

/**
 * Custom hook that sets up keyboard shortcuts for media controls.
 * Handles both media keys and standard keyboard shortcuts while avoiding conflicts with active inputs.
 * @param handlers - Object containing media control handler functions
 */

const useKeyMediaControls = (handlers: KeyMediaControlHandlers): null => {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const activeElement = document.activeElement;
      const isActiveInput =
        activeElement &&
        ((activeElement.tagName === 'INPUT' && (activeElement as HTMLInputElement).type !== 'range') ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable);

      switch (event.key) {
        case 'MediaPlayPause':
          event.preventDefault();
          handlers.playPause();
          break;
        case 'MediaTrackPrevious':
          event.preventDefault();
          handlers.prev();
          break;
        case 'MediaTrackNext':
          event.preventDefault();
          handlers.next();
          break;
        case ' ':
          if (!isActiveInput) {
            event.preventDefault();
            handlers.playPause();
          }
          break;
        case 'ArrowLeft':
          if (!isActiveInput) {
            event.preventDefault();
            handlers.prev();
          }
          break;
        case 'ArrowRight':
          if (!isActiveInput) {
            event.preventDefault();
            handlers.next();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    // cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);

  return null;
};

export default useKeyMediaControls;
