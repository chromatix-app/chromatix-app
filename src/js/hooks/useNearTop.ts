import { useState, useEffect, RefObject } from 'react';

/**
 * Custom hook that tracks whether a referenced element is near the top of the viewport.
 * Monitors scroll events to determine if the element is within the specified offset from the top.
 * @param ref - React ref object pointing to the element to monitor
 * @param offset - Distance in pixels from the top to consider "near top"
 * @returns Boolean indicating whether the element is near the top
 */

const useNearTop = (ref: RefObject<HTMLElement>, offset: number): boolean => {
  const [isNearTop, setIsNearTop] = useState(false);

  useEffect(() => {
    const checkIfNearTop = (): void => {
      const rect = ref.current?.getBoundingClientRect();
      setIsNearTop(!rect || rect.top <= offset);
    };

    const contentElement = document.getElementById('content');
    const scrollableElement = document.getElementById('scrollable');
    const actualElement = scrollableElement || contentElement;

    if (actualElement) {
      actualElement.addEventListener('scroll', checkIfNearTop, { passive: true });
      checkIfNearTop();

      return () => {
        actualElement.removeEventListener('scroll', checkIfNearTop);
      };
    }
  }, [ref, offset]);

  return isNearTop;
};

export default useNearTop;
