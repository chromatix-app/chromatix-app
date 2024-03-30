// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { Icon, RangeSlider } from 'js/components';
import { durationToStringShort } from 'js/utils';

import style from './ControlBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ControlBar = () => {
  const dispatch = useDispatch();

  const playerPlaying = useSelector(({ appModel }) => appModel.playerPlaying);
  const playerVolume = useSelector(({ appModel }) => appModel.playerVolume);
  const playerMuted = useSelector(({ appModel }) => appModel.playerMuted);

  // const playingVariant = useSelector(({ appModel }) => appModel.playingVariant);
  // const playingServerId =  useSelector(({ appModel }) => appModel.playingServerId);
  // const playingLibraryId =  useSelector(({ appModel }) => appModel.playingLibraryId);
  // const playingAlbumId =  useSelector(({ appModel }) => appModel.playingAlbumId);
  // const playingPlaylistId =  useSelector(({ appModel }) => appModel.playingPlaylistId);
  const playingTrackList = useSelector(({ appModel }) => appModel.playingTrackList);
  // const playingTrackCount =  useSelector(({ appModel }) => appModel.playingTrackCount);
  const playingTrackIndex = useSelector(({ appModel }) => appModel.playingTrackIndex);

  const trackDetail = playingTrackList?.[playingTrackIndex];
  const isDisabled = !trackDetail ? true : false;

  const volIcon = playerMuted || playerVolume <= 0 ? 'VolXIcon' : playerVolume < 50 ? 'VolLowIcon' : 'VolHighIcon';

  return (
    <div className={style.wrap}>
      <div className={style.current}>
        <div className={style.cover}>
          {trackDetail && trackDetail.thumb && <img src={trackDetail.thumb} alt={trackDetail.title} />}
        </div>
        <div className={style.text}>
          <div className={style.title}>{trackDetail?.title}</div>
          <div className={style.artist}>{trackDetail?.artist}</div>
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
          <div className={style.scrubLeft}>{!isDisabled && '0:00'}</div>
          <div className={style.scrubSlider}>
            <RangeSlider />
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
