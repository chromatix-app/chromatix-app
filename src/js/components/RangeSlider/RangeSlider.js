// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

// import { useDebounce } from 'js/hooks';

import style from './RangeSlider.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const RangeSlider = ({ min = 0, max = 100, step = 1, value, handleChange }) => {
  return (
    <div className={style.wrap}>
      <div className={clsx(style.input)}>
        <div className={style.track}>
          <div
            className={style.fill}
            style={{
              width: value + '%',
            }}
          ></div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default RangeSlider;
