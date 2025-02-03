import { useEffect } from 'react';

const useKeyControl = (keyCombination, callback) => {
  useEffect(() => {
    // console.log('Esc Bind 111');
    const keys = keyCombination.split('+').map((key) => key.trim().toLowerCase());

    const handleKeyDown = (e) => {
      const pressedKeys = [];
      if (e.ctrlKey || e.metaKey) pressedKeys.push('command');
      if (e.altKey) pressedKeys.push('alt');
      if (e.shiftKey) pressedKeys.push('shift');
      pressedKeys.push(e.key.toLowerCase());

      if (keys.every((key) => pressedKeys.includes(key))) {
        console.log('Key pressed: ' + keyCombination);
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // console.log('Esc Unbind 333');
      window.removeEventListener('keydown', handleKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyCombination, callback]);
};

export default useKeyControl;
