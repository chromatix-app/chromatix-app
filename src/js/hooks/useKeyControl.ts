import { useEffect } from 'react';

/**
 * Custom hook that sets up keyboard shortcut listeners for specific key combinations.
 * Supports modifier keys (command/ctrl, alt, shift) and handles key combination matching.
 * @param keyCombination - String representing the key combination (e.g., "command+k", "alt+shift+f")
 * @param callback - Function to execute when the key combination is pressed
 * @param preventDefault - Whether to prevent the default browser behavior for the key combination
 */

const useKeyControl = (keyCombination: string, callback: () => void, preventDefault?: boolean): void => {
  useEffect(() => {
    // console.log('Esc Bind 111');
    const keys = keyCombination.split('+').map((key) => key.trim().toLowerCase());

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key) {
        const pressedKeys: string[] = [];
        if (event.ctrlKey || event.metaKey) pressedKeys.push('command');
        if (event.altKey) pressedKeys.push('alt');
        if (event.shiftKey) pressedKeys.push('shift');
        pressedKeys.push(event.key.toLowerCase());

        if (keys.every((key) => pressedKeys.includes(key))) {
          console.log('Key pressed: ' + keyCombination);
          if (preventDefault) event.preventDefault();
          callback();
        }
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
