import { useRef, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const useScrollRestoration = () => {
  const history = useHistory();

  const windowScrollPositions = useRef({});
  const contentScrollPositions = useRef({});
  const previousPathname = useRef(history.location.pathname);

  const historyListener = useCallback((location, action) => {
    const contentElement = document.getElementById('content');

    // Save the current scroll positions
    if (previousPathname.current) {
      windowScrollPositions.current = {
        ...windowScrollPositions.current,
        [previousPathname.current]: window.scrollY,
      };
      contentScrollPositions.current = {
        ...contentScrollPositions.current,
        [previousPathname.current]: contentElement ? contentElement.scrollTop : 0,
      };
    }

    // Store the scroll position history in session storage
    sessionStorage.setItem('music-window-scroll-positions', JSON.stringify(windowScrollPositions.current));
    sessionStorage.setItem('music-content-scroll-positions', JSON.stringify(contentScrollPositions.current));

    if (action === 'PUSH' || action === 'REPLACE') {
      window.scrollTo(0, 0);
      if (contentElement) {
        contentElement.scrollTo(0, 0);
      }
    } else if (action === 'POP') {
      requestAnimationFrame(() => {
        if (windowScrollPositions.current[location.pathname] !== undefined) {
          window.scrollTo(0, windowScrollPositions.current[location.pathname]);
        }
        if (contentScrollPositions.current[location.pathname] !== undefined && contentElement) {
          contentElement.scrollTo(0, contentScrollPositions.current[location.pathname]);
        }
      });
    }
    previousPathname.current = location.pathname;
  }, []);

  useEffect(() => {
    const pageAccessedByReload =
      window.performance?.navigation?.type === 1 ||
      window.performance
        .getEntriesByType('navigation')
        .map((nav) => nav.type)
        .includes('reload');

    if (pageAccessedByReload) {
      // Load the scroll position history from session storage
      const storedWindowScrollPositions = sessionStorage.getItem('music-window-scroll-positions');
      const storedContentScrollPositions = sessionStorage.getItem('music-content-scroll-positions');
      if (storedWindowScrollPositions) {
        windowScrollPositions.current = JSON.parse(storedWindowScrollPositions);
      }
      if (storedContentScrollPositions) {
        contentScrollPositions.current = JSON.parse(storedContentScrollPositions);
      }
    }

    return history.listen(historyListener);
  }, [history, historyListener]);

  return null;
};

export default useScrollRestoration;
