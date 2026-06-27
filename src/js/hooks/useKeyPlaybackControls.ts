import { useEffect } from 'react';
import { useSelector } from 'react-redux';

interface KeyMediaControlHandlers {
  playPause: () => void;
  prev: () => void;
  next: () => void;
}

// Roles (and elements) that use space for activation
const SPACE_ACTIVATABLE_ROLES = [
  'checkbox',
  'combobox',
  'listbox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'switch',
  'tab',
];

// Roles that use arrow keys for internal navigation
const ARROW_NAVIGABLE_ROLES = [
  //
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'slider',
  'tab',
];

/**
 * Custom hook that sets up keyboard shortcuts for media controls.
 * Handles both media keys and standard keyboard shortcuts while avoiding conflicts with active inputs.
 * Space bar and arrow key shortcuts are controlled by the keyboardSpace and keyboardArrows session settings.
 * @param handlers - Object containing media control handler functions
 */

const useKeyPlaybackControls = (handlers: KeyMediaControlHandlers): null => {
  const keyboardMediaKeys = useSelector(
    ({ sessionModel }: { sessionModel: { keyboardMediaKeys: boolean } }) => sessionModel.keyboardMediaKeys
  );
  const keyboardSpace = useSelector(
    ({ sessionModel }: { sessionModel: { keyboardSpace: boolean } }) => sessionModel.keyboardSpace
  );
  const keyboardArrows = useSelector(
    ({ sessionModel }: { sessionModel: { keyboardArrows: boolean } }) => sessionModel.keyboardArrows
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const activeElement = document.activeElement;
      const isActiveInput =
        activeElement &&
        ((activeElement.tagName === 'INPUT' && (activeElement as HTMLInputElement).type !== 'range') ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable);

      // Shared checks used across multiple shortcut guards below
      const activeRole = activeElement?.getAttribute('role');
      const allowKeyControls = activeElement?.closest('[data-allow-key-controls]');

      // Skip space shortcut when focus is on an element that uses space for its own activation
      const isSpaceActivatable =
        !allowKeyControls &&
        (activeElement?.tagName === 'BUTTON' ||
          activeElement?.tagName === 'A' ||
          !!(activeRole && SPACE_ACTIVATABLE_ROLES.includes(activeRole)));

      // Skip arrow key shortcuts when focus is on an element that uses arrow keys for its own navigation
      const isArrowNavigable =
        !allowKeyControls &&
        ((activeElement?.tagName === 'INPUT' && (activeElement as HTMLInputElement).type === 'range') ||
          (activeRole && ARROW_NAVIGABLE_ROLES.includes(activeRole)));

      switch (event.key) {
        case 'MediaPlayPause':
          if (keyboardMediaKeys) {
            event.preventDefault();
            handlers.playPause();
          }
          break;
        case 'MediaTrackPrevious':
          if (keyboardMediaKeys) {
            event.preventDefault();
            handlers.prev();
          }
          break;
        case 'MediaTrackNext':
          if (keyboardMediaKeys) {
            event.preventDefault();
            handlers.next();
          }
          break;
        case ' ':
          if (keyboardSpace && !isActiveInput && !isSpaceActivatable) {
            event.preventDefault();
            handlers.playPause();
          }
          break;
        case 'ArrowLeft':
          if (keyboardArrows && !isActiveInput && !isArrowNavigable) {
            event.preventDefault();
            handlers.prev();
          }
          break;
        case 'ArrowRight':
          if (keyboardArrows && !isActiveInput && !isArrowNavigable) {
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
  }, [handlers, keyboardMediaKeys, keyboardSpace, keyboardArrows]);

  return null;
};

export default useKeyPlaybackControls;
