import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { electronPlatform, isElectron, sendToElectron } from 'js/utils';

const useElectronStatus = () => {
  const dispatch = useDispatch();

  const inited = useRef(false);

  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
  const isDisabled = !trackCurrent ? true : false;
  const isDisabledRef = useRef(isDisabled);

  const enableStatus = isElectron && electronPlatform === 'win';

  // Update a ref here to avoid closure issues
  useEffect(() => {
    isDisabledRef.current = isDisabled;
  }, [isDisabled]);

  // Send the player status to Electron
  useEffect(() => {
    try {
      if (enableStatus) {
        const playerStatus = isDisabled ? 'disabled' : playerPlaying ? 'playing' : 'paused';
        sendToElectron('any', 'player-status', {
          status: playerStatus,
          title: trackCurrent?.title,
          artist: trackCurrent?.artist,
          album: trackCurrent?.album,
          // artwork: trackCurrent?.thumb,
        });
      }
    } catch (_error) {
      // Handle error
    }
  }, [isDisabled, playerPlaying, trackCurrent, enableStatus]);

  // Listen for incoming messages from Electron
  useEffect(() => {
    try {
      if (!inited.current && window.ipcRenderer) {
        window.ipcRenderer.on('message', function (_event, message) {
          if (enableStatus) {
            console.log('%c--- from electron - ' + message + ' ---', 'font-weight:bold;');
            try {
              switch (message) {
                case 'action-media-play':
                  !isDisabledRef.current && dispatch.playerModel.playerResume();
                  break;
                case 'action-media-pause':
                  !isDisabledRef.current && dispatch.playerModel.playerPause();
                  break;
                case 'action-media-previous':
                  !isDisabledRef.current && dispatch.playerModel.playerPrev();
                  break;
                case 'action-media-next':
                  !isDisabledRef.current && dispatch.playerModel.playerNext();
                  break;
                default:
                  break;
              }
            } catch (_error) {
              // Handle error
            }
          } else {
            console.log('%c--- from electron (ignored) - ' + message + ' ---', 'font-weight:bold;');
          }
        });
        inited.current = true;
      }
    } catch (_error) {
      // Handle error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useElectronStatus;
