import { useRef, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import config from 'js/_config/config';

const { contentPosKey, windowPosKey } = config;

const useScrollRestoration = () => {
  const history = useHistory();

  const windowScrollPositions = useRef({});
  const contentScrollPositions = useRef({});
  const previousPathname = useRef(history.location.pathname);

  const historyListener = useCallback((location, action) => {
    const contentElement = document.getElementById('content');
    const scrollableElement = document.getElementById('scrollable');
    const actualElement = scrollableElement || contentElement;

    // Save the current scroll positions
    if (previousPathname.current) {
      windowScrollPositions.current = {
        ...windowScrollPositions.current,
        [previousPathname.current]: window.scrollY,
      };
      contentScrollPositions.current = {
        ...contentScrollPositions.current,
        [previousPathname.current]: actualElement ? actualElement.scrollTop : 0,
      };
    }

    // Store the scroll position history in session storage
    sessionStorage.setItem(windowPosKey, JSON.stringify(windowScrollPositions.current));
    sessionStorage.setItem(contentPosKey, JSON.stringify(contentScrollPositions.current));

    // Scroll to the top of the page on normal navigation
    if (action === 'PUSH' || action === 'REPLACE') {
      window.scrollTo(0, 0);
      if (actualElement) {
        actualElement.scrollTo(0, 0);
      }
    }

    // Scroll to the previous position on history navigation
    else if (action === 'POP') {
      requestAnimationFrame(() => {
        const contentElement = document.getElementById('content');
        const scrollableElement = document.getElementById('scrollable');
        const actualElement = scrollableElement || contentElement;

        if (windowScrollPositions.current[location.pathname] !== undefined) {
          window.scrollTo(0, windowScrollPositions.current[location.pathname]);
        }
        if (contentScrollPositions.current[location.pathname] !== undefined && actualElement) {
          actualElement.scrollTo(0, contentScrollPositions.current[location.pathname]);
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
      const storedWindowScrollPositions = sessionStorage.getItem(windowPosKey);
      const storedContentScrollPositions = sessionStorage.getItem(contentPosKey);
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
