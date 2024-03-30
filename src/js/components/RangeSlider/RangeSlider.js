// ======================================================================
// IMPORTS
// ======================================================================

import { debounce } from 'lodash';
import clsx from 'clsx';

import style from './RangeSlider.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const RangeSlider = ({ min = 0, max = 100, step = 1, value, handleChange, handleMouseDown, handleMouseUp }) => {
  const widthPercent = ((value - min) / (max - min)) * 100;

  const debouncedHandleChange = debounce(handleChange, 10);

  return (
    <div className={style.wrap}>
      <div className={clsx(style.input)}>
        <div className={style.track}>
          <div
            className={style.fill}
            style={{
              width: widthPercent + '%',
            }}
          ></div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => debouncedHandleChange(parseFloat(e.target.value))}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default RangeSlider;
