import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const enablePolling = false;

/**
 * Custom hook that monitors network connectivity using multiple detection methods.
 * Combines navigator.onLine status with optional URL polling for reliable online/offline detection.
 * @param pollingUrl - URL to poll for internet connectivity (default: 'https://chromatix.app')
 * @param pollingInterval - Polling interval in milliseconds (default: 5000)
 * @returns Boolean indicating current online status
 */

const useNetworkStatus = (pollingUrl: string = 'https://chromatix.app', pollingInterval: number = 5000): boolean => {
  const dispatch = useDispatch();

  const isCurrentlyOnline = useSelector(({ appModel }: any) => appModel.isOnline);

  const [navigatorIsOnline, setNavigatorIsOnline] = useState<boolean>(navigator?.onLine ?? true);
  const [pollingIsOnline, setPollingIsOnline] = useState<boolean>(true);
  const [navigatorHasBeenOnline, setNavigatorHasBeenOnline] = useState<boolean>(navigator?.onLine ?? true);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Handle navigator network status
  const updateNetworkStatus = (): void => {
    setNavigatorIsOnline(navigator?.onLine ?? true);
  };

  // Handle polling network status
  const pollNetworkStatus = async (): Promise<void> => {
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
    let intervalId: ReturnType<typeof setInterval> | undefined;

    // Polling for internet access
    if (enablePolling) {
      intervalId = setInterval(pollNetworkStatus, pollingInterval);
      pollNetworkStatus();
    }

    // Clean up event listeners and interval on unmount
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (enablePolling && intervalId) {
        clearInterval(intervalId);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingUrl, pollingInterval]);

  return isOnline;
};

export default useNetworkStatus;
