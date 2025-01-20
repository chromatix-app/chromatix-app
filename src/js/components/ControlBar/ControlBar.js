// ======================================================================
// IMPORTS
// ======================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { track } from '@vercel/analytics';
import clsx from 'clsx';

import { Icon, RangeSlider } from 'js/components';
import { useKeyboardControls, useMediaControls, useMediaMeta } from 'js/hooks';
import { durationToStringShort } from 'js/utils';

import style from './ControlBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ControlBar = () => {
  const dispatch = useDispatch();

  const { playerLoading, playerPlaying, playerVolume, playerMuted } = useSelector(({ playerModel }) => playerModel);

  const {
    playingVariant,
    playingLibraryId,
    playingAlbumId,
    playingPlaylistId,
    playingTrackList,
    playingTrackIndex,
    playingTrackKeys,
    playingRepeat,
    playingShuffle,
    queueIsVisible,
  } = useSelector(({ sessionModel }) => sessionModel);

  const playingLink =
    playingVariant === 'albums'
      ? `/albums/${playingLibraryId}/${playingAlbumId}`
      : `/playlists/${playingLibraryId}/${playingPlaylistId}`;

  const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
  const isDisabled = !trackCurrent ? true : false;

  const volIcon = playerMuted || playerVolume <= 0 ? 'VolXIcon' : playerVolume < 50 ? 'VolLowIcon' : 'VolHighIcon';

  // handle keyboard controls
  const controlHandlers = useMemo(
    () => ({
      playPause: () =>
        !isDisabled && (!playerPlaying ? dispatch.playerModel.playerPlay() : dispatch.playerModel.playerPause()),
      play: () => !isDisabled && dispatch.playerModel.playerPlay(),
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

  useKeyboardControls(controlHandlers);
  useMediaControls(controlHandlers);
  useMediaMeta(trackMeta);

  return (
    <div className={style.wrap}>
      <div className={style.current}>
        <div className={style.cover}>
          {trackCurrent && trackCurrent.thumb && (
            <NavLink
              className={style.coverLink}
              to={playingLink}
              onClick={() => {
                dispatch.appModel.setAppState({ scrollToPlaying: true });
                track('Navigate to Playing');
              }}
            >
              <img src={trackCurrent.thumb} alt={trackCurrent.title} />
            </NavLink>
          )}
        </div>
        <div className={style.text}>
          {trackCurrent && (
            <>
              <div className={style.title}>{trackCurrent.title}</div>
              <div className={style.artist}>
                {trackCurrent.artistLink && <NavLink to={trackCurrent.artistLink}>{trackCurrent.artist}</NavLink>}
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
            <button className={style.play} onClick={dispatch.playerModel.playerPlay} disabled={isDisabled}>
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
          <button className={style.volume} onClick={dispatch.playerModel.playerMuteToggle}>
            <Icon icon={volIcon} cover stroke />
          </button>
        </div>
        <div className={style.volSlider}>
          <RangeSlider value={playerMuted ? 0 : playerVolume} handleChange={dispatch.playerModel.playerVolumeSet} />
        </div>
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

  const { playerElement, playerInteractionCount } = useSelector(({ playerModel }) => playerModel);
  const { playingTrackList, playingTrackIndex, playingTrackKeys } = useSelector(({ sessionModel }) => sessionModel);

  const [trackProgress, setTrackProgress] = useState(playerElement?.currentTime * 1000 || 0);

  const realIndex = playingTrackKeys?.[playingTrackIndex];
  const trackCurrent = playingTrackList?.[realIndex];
  const isDisabled = !trackCurrent ? true : false;

  const trackProgressCurrent = trackProgress / 1000;
  const trackProgressTotal = trackCurrent?.duration ? trackCurrent?.duration / 1000 : 0;

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
    playerElement.currentTime = trackProgress / 1000;
  };

  // handle track progress
  const updateTrackProgress = (playerElement, mouseDownRef, counterRef, setTrackProgress, dispatch) => {
    if (!mouseDownRef.current) {
      const newTrackProgress = Math.round(playerElement.currentTime) * 1000;
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
    if (playerElement) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        updateTrackProgress(playerElement, mouseDownRef, counterRef, setTrackProgress, dispatch);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerElement, playingTrackIndex]);

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
          max={trackProgressTotal}
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
