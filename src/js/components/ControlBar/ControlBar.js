// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { Icon, RangeSlider } from 'js/components';
import { useKeyboardControls } from 'js/hooks';
import { durationToStringShort } from 'js/utils';

import style from './ControlBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ControlBar = () => {
  const dispatch = useDispatch();

  const counterRef = useRef(0);
  const didMountRef = useRef(false);
  const intervalRef = useRef(null);
  const mouseDownRef = useRef(false);

  const playerElement = useSelector(({ appModel }) => appModel.playerElement);
  const playerPlaying = useSelector(({ appModel }) => appModel.playerPlaying);
  const playerVolume = useSelector(({ appModel }) => appModel.playerVolume);
  const playerMuted = useSelector(({ appModel }) => appModel.playerMuted);
  const playerInteractionCount = useSelector(({ appModel }) => appModel.playerInteractionCount);

  const playingVariant = useSelector(({ sessionModel }) => sessionModel.playingVariant);
  // const playingServerId =  useSelector(({ sessionModel }) => sessionModel.playingServerId);
  const playingLibraryId = useSelector(({ sessionModel }) => sessionModel.playingLibraryId);
  const playingAlbumId = useSelector(({ sessionModel }) => sessionModel.playingAlbumId);
  const playingPlaylistId = useSelector(({ sessionModel }) => sessionModel.playingPlaylistId);
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  // const playingTrackCount =  useSelector(({ sessionModel }) => sessionModel.playingTrackCount);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackProgress = useSelector(({ sessionModel }) => sessionModel.playingTrackProgress);

  const [trackProgress, setTrackProgress] = useState(playingTrackProgress);

  const playingLink =
    playingVariant === 'album'
      ? `/albums/${playingLibraryId}/${playingAlbumId}`
      : `/playlists/${playingLibraryId}/${playingPlaylistId}`;

  const trackDetail = playingTrackList?.[playingTrackIndex];
  const isDisabled = !trackDetail ? true : false;

  const volIcon = playerMuted || playerVolume <= 0 ? 'VolXIcon' : playerVolume < 50 ? 'VolLowIcon' : 'VolHighIcon';

  const trackProgressCurrent = trackProgress / 1000;
  const trackProgressTotal = trackDetail?.duration ? trackDetail?.duration / 1000 : 0;

  // handle keyboard controls
  useKeyboardControls({
    prev: () => !isDisabled && dispatch.appModel.playerPrev(),
    next: () => !isDisabled && dispatch.appModel.playerNext(),
    playPause: () => (!isDisabled && !playerPlaying ? dispatch.appModel.playerPlay() : dispatch.appModel.playerPause()),
  });

  // handle progress change
  const handleProgressChange = (value) => {
    setTrackProgress(value * 1000);
    dispatch.sessionModel.setPlayingTrackProgress(value * 1000);
  };

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
        dispatch.sessionModel.setPlayingTrackProgress(newTrackProgress);
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
    if (didMountRef.current) setTrackProgress(0);
    else didMountRef.current = true;
  }, [playingTrackIndex, playerInteractionCount]);

  return (
    <div className={style.wrap}>
      <div className={style.current}>
        <div className={style.cover}>
          {trackDetail && trackDetail.thumb && (
            <NavLink className={style.cover} to={playingLink}>
              <img src={trackDetail.thumb} alt={trackDetail.title} />
            </NavLink>
          )}
        </div>
        <div className={style.text}>
          {trackDetail && (
            <>
              <div className={style.title}>{trackDetail.title}</div>
              <NavLink className={style.artist} to={trackDetail.artistLink}>
                {trackDetail.artist}
              </NavLink>
            </>
          )}
        </div>
      </div>

      <div>
        <div className={style.controls}>
          {/* <button className={style.shuffle} disabled={isDisabled}>
            <Icon icon="ShuffleIcon" cover stroke />
          </button> */}
          <button className={style.rewind} onClick={dispatch.appModel.playerPrev} disabled={isDisabled}>
            <Icon icon="RewindIcon" cover stroke />
          </button>
          {!playerPlaying && (
            <button className={style.play} onClick={dispatch.appModel.playerPlay} disabled={isDisabled}>
              <Icon icon="PlayFilledIcon" cover />
            </button>
          )}
          {playerPlaying && (
            <button className={style.pause} onClick={dispatch.appModel.playerPause}>
              <Icon icon="PauseFilledIcon" cover />
            </button>
          )}
          <button className={style.forward} onClick={dispatch.appModel.playerNext} disabled={isDisabled}>
            <Icon icon="FastForwardIcon" cover stroke />
          </button>
          {/* <button className={style.repeat} disabled={isDisabled}>
            <Icon icon="RepeatIcon" cover stroke />
          </button> */}
        </div>

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
          <div className={style.scrubRight}>{!isDisabled && durationToStringShort(trackDetail?.duration)}</div>
        </div>
      </div>

      <div className={style.secondary}>
        {/* <button className={style.queue}>
          <Icon icon="QueueIcon" cover stroke />
        </button> */}
        <button className={style.volHigh} onClick={dispatch.appModel.playerMuteToggle}>
          <Icon icon={volIcon} cover stroke />
        </button>
        <div className={style.volSlider}>
          <RangeSlider value={playerMuted ? 0 : playerVolume} handleChange={dispatch.appModel.playerVolumeSet} />
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ControlBar;
