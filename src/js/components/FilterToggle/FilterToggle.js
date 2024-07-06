// ======================================================================
// IMPORTS
// ======================================================================

import { Icon } from 'js/components';

import style from './FilterToggle.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const FilterToggle = ({ value, options, setter, icon = 'ArrowsVerticalIcon' }) => {
  const handleValueChange = () => {
    const otherOption = options.find((option) => option.value !== value);
    setter(otherOption.value);
  };

  const valueString = options.find((option) => option.value === value)?.label;

  return (
    <div className={style.wrap}>
      <button className={style.trigger} onClick={handleValueChange}>
        <span className={style.icon}>
          <Icon icon={icon} cover stroke />
        </span>
        <span>{valueString}</span>
      </button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FilterToggle;
