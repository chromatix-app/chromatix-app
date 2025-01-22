import { useEffect } from 'react';

const useKeyboardControls = (handlers) => {
  useEffect(() => {
    function handleKeyDown(event) {
      const activeElement = document.activeElement;
      const isActiveInput =
        activeElement &&
        ((activeElement.tagName === 'INPUT' && activeElement.type !== 'range') ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      console.log(isActiveInput, activeElement);

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

export default useKeyboardControls;
