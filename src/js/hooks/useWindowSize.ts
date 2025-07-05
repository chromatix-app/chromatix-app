import { useEffect, useState, useRef } from 'react';

interface WindowSize {
  windowWidth: number;
  windowHeight: number;
  screenWidth: number;
  screenHeight: number;
}

interface ScreenSize {
  screenWidth: number;
  screenHeight: number;
}

/**
 * Gets the current screen dimensions, handling standalone app orientation changes.
 * @returns Screen width and height dimensions
 */
const getScreenSize = (): ScreenSize => {
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  if (window.navigator && !!window.navigator.standalone) {
    if (window.orientation && (window.orientation === 90 || window.orientation === -90)) {
      screenWidth = window.screen.height;
      screenHeight = window.screen.width;
    } else {
      screenWidth = window.screen.width;
      screenHeight = window.screen.height;
    }
  }
  return {
    screenWidth,
    screenHeight,
  };
};

/**
 * Hook that tracks window and screen dimensions with debounced updates.
 * @param debounce - Milliseconds to debounce resize events (default: 100)
 * @returns Object containing windowWidth, windowHeight, screenWidth, and screenHeight
 * @example
 * ```tsx
 * const { windowWidth, windowHeight } = useWindowSize();
 * const { screenWidth, screenHeight } = useWindowSize(200);
 * ```
 */
const useWindowSize = (debounce: number = 100): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    ...getScreenSize(),
  });

  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleResize(): void {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      timerIdRef.current = setTimeout(() => {
        setWindowSize({
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          ...getScreenSize(),
        });
      }, debounce);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    handleResize();

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [debounce]);

  return windowSize;
};

export default useWindowSize;
