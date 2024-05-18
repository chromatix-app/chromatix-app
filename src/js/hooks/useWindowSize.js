import { useEffect, useState, useRef } from 'react';

const getScreenSize = () => {
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

const useWindowSize = (debounce = 100) => {
  const [windowSize, setWindowSize] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    ...getScreenSize(),
  });

  const timerIdRef = useRef(null);

  useEffect(() => {
    function handleResize() {
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
