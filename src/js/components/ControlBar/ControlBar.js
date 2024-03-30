// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { Icon, RangeSlider } from 'js/components';
import { durationToStringShort } from 'js/utils';

import style from './ControlBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ControlBar = () => {
  // const playerVariant = useSelector(({ appModel }) => appModel.playerVariant);
  // const playerServerId =  useSelector(({ appModel }) => appModel.playerServerId);
  // const playerLibraryId =  useSelector(({ appModel }) => appModel.playerLibraryId);
  // const playerAlbumId =  useSelector(({ appModel }) => appModel.playerAlbumId);
  // const playerPlaylistId =  useSelector(({ appModel }) => appModel.playerPlaylistId);
  const playerTrackList = useSelector(({ appModel }) => appModel.playerTrackList);
  // const playerTrackCount =  useSelector(({ appModel }) => appModel.playerTrackCount);
  const playerTrackIndex = useSelector(({ appModel }) => appModel.playerTrackIndex);

  const trackDetail = playerTrackList?.[playerTrackIndex];

  console.log('trackDetail', trackDetail);

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
          <button className={style.shuffle}>
            <Icon icon="ShuffleIcon" cover stroke />
          </button>
          <button className={style.rewind}>
            <Icon icon="RewindIcon" cover stroke />
          </button>
          <button className={style.play}>
            <Icon icon="PlayFilledIcon" cover />
          </button>
          {/* <button className={style.pause}>
          <Icon icon="PauseFilledIcon" cover />
        </button> */}
          <button className={style.forward}>
            <Icon icon="FastForwardIcon" cover stroke />
          </button>
          <button className={style.repeat}>
            <Icon icon="RepeatIcon" cover stroke />
          </button>
        </div>

        <div className={style.scrubber}>
          <div className={style.scrubLeft}>0:00</div>
          <div className={style.scrubSlider}>
            <RangeSlider />
          </div>
          <div className={style.scrubRight}>{durationToStringShort(trackDetail?.duration)}</div>
        </div>
      </div>

      <div className={style.secondary}>
        <button className={style.queue}>
          <Icon icon="QueueIcon" cover stroke />
        </button>
        <button className={style.volHigh}>
          <Icon icon="VolHighIcon" cover stroke />
        </button>
        <div className={style.volSlider}>
          <RangeSlider />
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ControlBar;
