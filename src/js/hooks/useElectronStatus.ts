import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getEnvironment, sendToElectron } from 'js/utils';

const envData = getEnvironment();

/**
 * Custom hook that manages Electron integration for media controls and status updates.
 * Sends player status to Electron and listens for media control messages from the main process.
 */

const useElectronStatus = (): void => {
  const dispatch = useDispatch();

  const inited = useRef(false);

  const playerPlaying = useSelector(({ playerModel }: any) => playerModel.playerPlaying);
  const playingTrackList = useSelector(({ sessionModel }: any) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }: any) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }: any) => sessionModel.playingTrackKeys);

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
  const isDisabled = !trackCurrent ? true : false;
  const isDisabledRef = useRef(isDisabled);

  const isLinuxApp = envData.isElectron && envData.electronPlatformId === 'lin';
  const isWindowsApp = envData.isElectron && envData.electronPlatformId === 'win';

  // Update a ref here to avoid closure issues
  useEffect(() => {
    isDisabledRef.current = isDisabled;
  }, [isDisabled]);

  // Send the player status to Electron
  useEffect(() => {
    try {
      if (isWindowsApp) {
        const playerStatus = isDisabled ? 'disabled' : playerPlaying ? 'playing' : 'paused';
        sendToElectron('any', 'player-status', {
          status: playerStatus,
          title: trackCurrent?.title,
          artist: trackCurrent?.artist,
          album: trackCurrent?.album,
          // artwork: trackCurrent?.thumbSm,
        });
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }
  }, [isDisabled, playerPlaying, trackCurrent, isWindowsApp]);

  // Listen for incoming messages from Electron
  useEffect(() => {
    const messageHandler = (_event: any, message: string) => {
      if (isWindowsApp) {
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
        } catch (error) {
          // Handle error
          console.error(error);
        }
      } else {
        console.log('%c--- from electron (ignored) - ' + message + ' ---', 'font-weight:bold;');
      }
    };

    const updateMenuHandler = (_event: any, message: any) => {
      if (isLinuxApp || isWindowsApp) {
        dispatch.appModel.setAppState({ electronMenu: JSON.parse(message) });
      }
    };

    try {
      if (!inited.current && window.ipcRenderer) {
        window.ipcRenderer.on('message', messageHandler);
        window.ipcRenderer.on('updateMenu', updateMenuHandler);
        inited.current = true;
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }

    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.removeListener('message', messageHandler);
        window.ipcRenderer.removeListener('updateMenu', updateMenuHandler);
      }
      inited.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useElectronStatus;
