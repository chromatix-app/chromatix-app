// ======================================================================
// IMPORTS
// ======================================================================

import debounce from 'lodash/debounce';
import clsx from 'clsx';

import style from './RangeSlider.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const RangeSlider = ({
  id,
  min = 0,
  max = 100,
  step = 1,
  value,
  handleChange,
  handleMouseDown,
  handleMouseUp,
  isDisabled,
  allowAccess = true,
}) => {
  const widthPercent = ((value - min) / (max - min)) * 100;

  const debouncedHandleChange = debounce(handleChange, 10);

  return (
    <div className={style.wrap}>
      <div className={clsx(style.input, allowAccess && style.inputAccessible)}>
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
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => debouncedHandleChange(parseFloat(event.target.value))}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            tabIndex={allowAccess ? 0 : -1}
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
