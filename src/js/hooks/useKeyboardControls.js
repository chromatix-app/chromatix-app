import { useEffect } from 'react';

const useKeyboardControls = (handlers) => {
  useEffect(() => {
    function handleKeyDown(event) {
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
          event.preventDefault();
          handlers.playPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlers.prev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handlers.next();
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
