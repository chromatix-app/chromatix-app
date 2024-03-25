// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import clsx from 'clsx';

// import { useDebounce } from 'js/hooks';

import style from './RangeSlider.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const RangeSlider = () => {
  const [value, setValue] = useState(50); // Initial value

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  // // handle the debounced value
  // useEffect(() => {
  //   if (!isInitialised) {
  //     setIsInitialised(true);
  //   } else {
  //     if (onRelease) {
  //       onRelease();
  //     }
  //   }
  //   // eslint-disable-next-line
  // }, [debouncedValue]);

  // useEffect(() => {
  //   setDisplayProps(determineProps(options, currentValue, maxValue));
  // }, [options, currentValue, maxValue]);

  // // save the changed value, even if it's not released
  // const handleChange = (e) => {
  //   if (onChange) {
  //     onChange(e);
  //   }
  // };

  // // submit the form on release
  // const handleRelease = (e) => {
  //   if (parseFloat(savedValue) !== parseFloat(e.target.value)) {
  //     setSavedValue(parseFloat(e.target.value));
  //     if (onRelease) {
  //       onRelease();
  //     }
  //   }
  // };

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
          min={0}
          max={100}
          step={0.1}
          value={value}
          onChange={handleChange}
          // onChange={handleChange}
          // onMouseUp={handleRelease}
          // onTouchEnd={handleRelease}
          // onKeyUp={handleKeyDown}
        />
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default RangeSlider;
