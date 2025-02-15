import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const enablePolling = false;

const useNetworkStatus = (pollingUrl = 'https://chromatix.app', pollingInterval = 5000) => {
  const dispatch = useDispatch();

  const isCurrentlyOnline = useSelector(({ appModel }) => appModel.isOnline);

  const [navigatorIsOnline, setNavigatorIsOnline] = useState(navigator?.onLine);
  const [pollingIsOnline, setPollingIsOnline] = useState(true);
  const [navigatorHasBeenOnline, setNavigatorHasBeenOnline] = useState(navigator?.onLine);
  const [isOnline, setIsOnline] = useState(true);

  // Handle navigator network status
  const updateNetworkStatus = () => {
    setNavigatorIsOnline(navigator?.onLine);
  };

  // Handle polling network status
  const pollNetworkStatus = async () => {
    try {
      const response = await fetch(pollingUrl, { method: 'HEAD', cache: 'no-cache' });
      // console.log(response);
      if (response.ok) {
        setPollingIsOnline(true);
      } else {
        setPollingIsOnline(false);
      }
    } catch {
      // console.log('Error fetching polling URL');
      setPollingIsOnline(false);
    }
  };

  // Handle combined network status
  useEffect(() => {
    if (!enablePolling) {
      if (navigatorHasBeenOnline && !navigatorIsOnline) {
        setIsOnline(false);
      } else {
        setIsOnline(true);
      }
    } else {
      // Both are online
      if (navigatorIsOnline && pollingIsOnline) {
        setIsOnline(true);
      }
      // Both are offline
      else if (!navigatorIsOnline && !pollingIsOnline) {
        setIsOnline(false);
      }
      // Navigator seems to be working, we can rely on that for offline detection
      // (but not for online detection, because it is known to give false positives
      // when there is a network connection but no internet access)
      else if (navigatorHasBeenOnline && !navigatorIsOnline) {
        setIsOnline(false);
      }
      // Fallback to rely on polling being online
      else if (pollingIsOnline) {
        setIsOnline(true);
      }
      // We seem to be offline
      else {
        setIsOnline(false);
      }
    }
  }, [navigatorIsOnline, pollingIsOnline, navigatorHasBeenOnline]);

  // Determine if navigator has ever been online
  useEffect(() => {
    if (navigatorIsOnline && !navigatorHasBeenOnline) {
      setNavigatorHasBeenOnline(navigatorIsOnline);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigatorIsOnline]);

  useEffect(() => {
    if (isOnline !== isCurrentlyOnline) {
      dispatch.appModel.setAppState({ isOnline });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Initialise
  useEffect(() => {
    // Update status on online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    let intervalId;

    // Polling for internet access
    if (enablePolling) {
      intervalId = setInterval(pollNetworkStatus, pollingInterval);
      pollNetworkStatus();
    }

    // Clean up event listeners and interval on unmount
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (enablePolling) {
        clearInterval(intervalId);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingUrl, pollingInterval]);

  return isOnline;
};

export default useNetworkStatus;
