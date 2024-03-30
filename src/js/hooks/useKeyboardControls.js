import { useEffect } from 'react';

const useKeyboardControls = (controls) => {
  useEffect(() => {
    function handleKeyDown(event) {
      switch (event.key) {
        case 'ArrowLeft':
          controls.prev();
          break;
        case 'ArrowRight':
          controls.next();
          break;
        case ' ':
          controls.playPause();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [controls]);

  return null;
};

export default useKeyboardControls;
