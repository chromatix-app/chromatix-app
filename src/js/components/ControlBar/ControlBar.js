// ======================================================================
// IMPORTS
// ======================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon, RangeSlider } from 'js/components';
import { useKeyMediaControls, useMediaControls, useMediaMeta } from 'js/hooks';
import { analyticsEvent, durationToStringShort } from 'js/utils';
import * as playerX from 'js/services/player';

import style from './ControlBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ControlBar = () => {
  const dispatch = useDispatch();

  const isOnline = useSelector(({ appModel }) => appModel.isOnline);

  const playerLoading = useSelector(({ playerModel }) => playerModel.playerLoading);
  const playerPlaying = useSelector(({ playerModel }) => playerModel.playerPlaying);

  const volumeLevel = useSelector(({ sessionModel }) => sessionModel.volumeLevel);
  const volumeMuted = useSelector(({ sessionModel }) => sessionModel.volumeMuted);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  const playingLibraryId = useSelector(({ sessionModel }) => sessionModel.playingLibraryId);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingFolderId = useSelector(({ sessionModel }) => sessionModel.playingFolderId);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingRepeat = useSelector(({ sessionModel }) => sessionModel.playingRepeat);
  const playingShuffle = useSelector(({ sessionModel }) => sessionModel.playingShuffle);
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const playingLink =
    playingVariant === 'albums'
      ? `/albums/${playingLibraryId}/${playingAlbumId}`
      : playingVariant === 'playlists'
      ? `/playlists/${playingLibraryId}/${playingPlaylistId}`
      : `/folders/${playingLibraryId}/${playingFolderId}`;

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
  const isDisabled = !trackCurrent ? true : false;

  const volIcon = volumeMuted || volumeLevel <= 0 ? 'VolXIcon' : volumeLevel < 50 ? 'VolLowIcon' : 'VolHighIcon';

  // handle keyboard controls
  const controlHandlers = useMemo(
    () => ({
      playPause: () =>
        !isDisabled && (!playerPlaying ? dispatch.playerModel.playerResume() : dispatch.playerModel.playerPause()),
      play: () => !isDisabled && dispatch.playerModel.playerResume(),
      pause: () => !isDisabled && dispatch.playerModel.playerPause(),
      prev: () => !isDisabled && dispatch.playerModel.playerPrev(),
      next: () => !isDisabled && dispatch.playerModel.playerNext(),
    }),
    [dispatch, isDisabled, playerPlaying]
  );

  const trackMeta = useMemo(() => {
    return trackCurrent
      ? {
          title: trackCurrent.title,
          artist: trackCurrent.artist,
          album: trackCurrent.album,
          artwork: [{ src: trackCurrent.thumb ? trackCurrent.thumb : null }],
        }
      : null;
  }, [trackCurrent]);

  useKeyMediaControls(controlHandlers);
  useMediaControls(controlHandlers);
  useMediaMeta(trackMeta);

  return (
    <div className={style.wrap}>
      <div className={style.current}>
        <div className={clsx(style.cover, { [style.coverPlaceholder]: !trackCurrent || !trackCurrent?.thumb })}>
          {trackCurrent && (
            <NavLink
              className={style.coverLink}
              to={playingLink}
              draggable="false"
              onClick={() => {
                dispatch.appModel.setAppState({ scrollToPlaying: true });
                analyticsEvent('Navigate to Playing');
              }}
            >
              {trackCurrent.thumb && <img src={trackCurrent.thumb} alt={trackCurrent.title} draggable="false" />}
            </NavLink>
          )}
        </div>
        <div className={style.text}>
          {trackCurrent && (
            <>
              <div className={style.title}>{trackCurrent.title}</div>
              <div className={style.artist}>
                {trackCurrent.artistLink && (
                  <NavLink to={trackCurrent.artistLink} draggable="false">
                    {trackCurrent.artist}
                  </NavLink>
                )}
                {!trackCurrent.artistLink && trackCurrent.artist}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <div className={style.controls}>
          <button
            className={clsx(style.shuffle, { [style.active]: playingShuffle })}
            onClick={dispatch.playerModel.playerShuffleToggle}
            disabled={isDisabled}
          >
            <Icon icon="ShuffleIcon" cover stroke />
          </button>
          <button className={style.rewind} onClick={dispatch.playerModel.playerPrev} disabled={isDisabled}>
            <Icon icon="RewindIcon" cover stroke />
          </button>
          {!playerPlaying && (
            <button className={style.play} onClick={dispatch.playerModel.playerResume} disabled={isDisabled}>
              <Icon icon="PlayFilledIcon" cover />
            </button>
          )}
          {playerPlaying && (
            <button className={style.pause} onClick={dispatch.playerModel.playerPause}>
              {!playerLoading && <Icon icon="PauseFilledIcon" cover />}
              {playerLoading && <div className={style.loading}></div>}
            </button>
          )}
          <button className={style.forward} onClick={dispatch.playerModel.playerNext} disabled={isDisabled}>
            <Icon icon="FastForwardIcon" cover stroke />
          </button>
          <button
            className={clsx(style.repeat, { [style.active]: playingRepeat })}
            onClick={dispatch.playerModel.playerRepeatToggle}
            disabled={isDisabled}
          >
            <Icon icon="RepeatIcon" cover stroke />
          </button>
        </div>

        <ControlProgress />
      </div>

      <div className={style.secondary}>
        <div className={style.secondaryControls}>
          <button
            className={clsx(style.queue, { [style.active]: queueIsVisible })}
            onClick={dispatch.sessionModel.queueVisibleToggle}
          >
            <Icon icon="QueueIcon" cover stroke />
          </button>
          <button className={style.volume} onClick={dispatch.playerModel.volumeMuteToggle}>
            <Icon icon={volIcon} cover stroke />
          </button>
        </div>
        <div className={style.volSlider}>
          <RangeSlider value={volumeMuted ? 0 : volumeLevel} handleChange={dispatch.playerModel.volumeLevelSet} />
        </div>
        {!isOnline && (
          <div className={style.secondaryControls}>
            <div className={style.offline} title="No Internet Connection">
              <Icon icon="CloudOfflineIcon" cover stroke strokeWidth={1.2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ControlProgress = () => {
  const dispatch = useDispatch();

  const counterRef = useRef(0);
  const didMountRef = useRef(false);
  const intervalRef = useRef(null);
  const mouseDownRef = useRef(false);

  const playerInited = useSelector(({ playerModel }) => playerModel.playerInited);
  const playerInteractionCount = useSelector(({ playerModel }) => playerModel.playerInteractionCount);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const [trackProgress, setTrackProgress] = useState(playerX.getCurrentProgress() * 1000 || 0);

  const realIndex = playingTrackKeys?.[playingTrackIndex];
  const trackCurrent = playingTrackList?.[realIndex];
  const isDisabled = !trackCurrent ? true : false;

  const trackProgressCurrent = trackProgress / 1000;
  const trackProgressMax = trackCurrent?.duration ? trackCurrent?.duration / 1000 : 0;

  // handle progress change
  const handleProgressChange = useCallback(
    (value) => {
      setTrackProgress(value * 1000);
      dispatch.playerModel.playerProgress(value * 1000);
    },
    [dispatch]
  );

  const handleProgressMouseDown = () => {
    mouseDownRef.current = true;
  };

  const handleProgressMouseUp = () => {
    mouseDownRef.current = false;
    playerX.setProgress(trackProgress);
  };

  // handle track progress
  const updateTrackProgress = (mouseDownRef, counterRef, setTrackProgress, dispatch) => {
    if (!mouseDownRef.current) {
      const newTrackProgress = Math.round(playerX.getCurrentProgress()) * 1000;
      setTrackProgress(newTrackProgress);
      // only update redux every 5 seconds
      counterRef.current += 1;
      if (counterRef.current === 5) {
        dispatch.playerModel.playerProgress(newTrackProgress);
        counterRef.current = 0;
      }
    }
  };

  // whilst track is playing, update track progress every second
  useEffect(() => {
    if (playerInited) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        updateTrackProgress(mouseDownRef, counterRef, setTrackProgress, dispatch);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerInited, playingTrackIndex]);

  // if a new track is selected, reset track progress
  useEffect(() => {
    if (didMountRef.current) {
      setTrackProgress(0);
    } else {
      didMountRef.current = true;
    }
  }, [realIndex, playerInteractionCount]);

  return (
    <div className={style.scrubber}>
      <div className={style.scrubLeft}>{!isDisabled && durationToStringShort(trackProgress)}</div>
      <div className={style.scrubSlider}>
        <RangeSlider
          max={trackProgressMax}
          value={trackProgressCurrent}
          handleChange={handleProgressChange}
          handleMouseDown={handleProgressMouseDown}
          handleMouseUp={handleProgressMouseUp}
          isDisabled={isDisabled}
        />
      </div>
      <div className={style.scrubRight}>{!isDisabled && durationToStringShort(trackCurrent?.duration)}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ControlBar;
