// ======================================================================
// IMPORTS
// ======================================================================

import { debounce } from 'lodash';
import clsx from 'clsx';

import style from './RangeSlider.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  handleChange,
  handleMouseDown,
  handleMouseUp,
  isDisabled,
}) => {
  const widthPercent = ((value - min) / (max - min)) * 100;

  const debouncedHandleChange = debounce(handleChange, 10);

  return (
    <div className={style.wrap}>
      <div className={clsx(style.input)}>
        <div className={style.track}>
          {!isDisabled && (
            <div
              className={style.fill}
              style={{
                width: widthPercent + '%',
              }}
            ></div>
          )}
        </div>
        {!isDisabled && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => debouncedHandleChange(parseFloat(event.target.value))}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            tabIndex={-1}
          />
        )}
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default RangeSlider;
