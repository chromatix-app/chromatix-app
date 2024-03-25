// ======================================================================
// IMPORTS
// ======================================================================

import { Icon, RangeSlider } from 'js/components';

import style from './ControlBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const ControlBar = () => {
  return (
    <div className={style.wrap}>
      <div className={style.current}>
        <div className={style.cover}></div>
        <div className={style.text}>
          <div className={style.title}>Ghost Love Score</div>
          <div className={style.artist}>Nightwish</div>
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
          <div className={style.scrubLeft}>2:47</div>
          <div className={style.scrubSlider}>
            <RangeSlider />
          </div>
          <div className={style.scrubRight}>3:40</div>
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
