// ======================================================================
// IMPORTS
// ======================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as playerX from 'js/services/player';

// ======================================================================
// TYPES
// ======================================================================

interface UsePlayerProgressOptions {
  updateStore?: boolean;
}

interface UsePlayerProgressReturn {
  trackProgress: number;
  trackProgressCurrent: number;
  trackProgressMax: number;
  handleProgressChange: (value: number) => void;
  handleProgressMouseDown: () => void;
  handleProgressMouseUp: () => void;
  isDisabled: boolean;
}

// ======================================================================
// HOOK
// ======================================================================

const usePlayerProgress = (options: UsePlayerProgressOptions = {}): UsePlayerProgressReturn => {
  const { updateStore = true } = options;

  const dispatch = useDispatch();

  const counterRef = useRef(0);
  const didMountRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mouseDownRef = useRef(false);

  const playerInited = useSelector(({ playerModel }: any) => playerModel.playerInited);
  const playerInteractionCount = useSelector(({ playerModel }: any) => playerModel.playerInteractionCount);

  const playingTrackList = useSelector(({ sessionModel }: any) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }: any) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }: any) => sessionModel.playingTrackKeys);

  const [trackProgress, setTrackProgress] = useState(playerX.getCurrentProgress() * 1000 || 0);

  const realIndex = playingTrackKeys?.[playingTrackIndex];
  const trackCurrent = playingTrackList?.[realIndex];
  const isDisabled = !trackCurrent;

  const trackProgressCurrent = trackProgress / 1000;
  const trackProgressMax = trackCurrent?.duration ? trackCurrent?.duration / 1000 : 0;

  // Handle progress change
  const handleProgressChange = useCallback(
    (value: number) => {
      setTrackProgress(value * 1000);
      if (updateStore) {
        dispatch.playerModel.playerProgress(value * 1000);
      }
    },
    [dispatch, updateStore]
  );

  // Handle mouse down (on scrubber)
  const handleProgressMouseDown = useCallback(() => {
    mouseDownRef.current = true;
  }, []);

  // Handle mouse up (on scrubber)
  const handleProgressMouseUp = useCallback(() => {
    mouseDownRef.current = false;
    playerX.setProgress(trackProgress);
  }, [trackProgress]);

  // Handle track progress updates
  const updateTrackProgress = useCallback(() => {
    if (!mouseDownRef.current) {
      const newTrackProgress = Math.round(playerX.getCurrentProgress()) * 1000;
      setTrackProgress(newTrackProgress);

      if (updateStore) {
        // Call the player.native updateProgress function for preloading
        playerX.updateProgress(newTrackProgress);

        // Only update redux every 5 seconds
        counterRef.current += 1;
        if (counterRef.current === 5) {
          dispatch.playerModel.playerProgress(newTrackProgress);
          counterRef.current = 0;
        }
      }
    }
  }, [dispatch, updateStore]);

  // Whilst track is playing, update track progress every second
  useEffect(() => {
    if (playerInited) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(updateTrackProgress, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playerInited, playingTrackIndex, updateTrackProgress]);

  // If a new track is selected, reset track progress
  useEffect(() => {
    if (didMountRef.current) {
      setTrackProgress(0);
    } else {
      didMountRef.current = true;
    }
  }, [realIndex, playerInteractionCount]);

  return {
    trackProgress,
    trackProgressCurrent,
    trackProgressMax,
    handleProgressChange,
    handleProgressMouseDown,
    handleProgressMouseUp,
    isDisabled,
  };
};

export default usePlayerProgress;
