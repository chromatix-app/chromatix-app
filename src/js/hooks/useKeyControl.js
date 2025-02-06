import { useEffect } from 'react';

const useKeyControl = (keyCombination, callback, preventDefault) => {
  useEffect(() => {
    // console.log('Esc Bind 111');
    const keys = keyCombination.split('+').map((key) => key.trim().toLowerCase());

    const handleKeyDown = (event) => {
      const pressedKeys = [];
      if (event.ctrlKey || event.metaKey) pressedKeys.push('command');
      if (event.altKey) pressedKeys.push('alt');
      if (event.shiftKey) pressedKeys.push('shift');
      pressedKeys.push(event.key.toLowerCase());

      if (keys.every((key) => pressedKeys.includes(key))) {
        console.log('Key pressed: ' + keyCombination);
        if (preventDefault) event.preventDefault();
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
