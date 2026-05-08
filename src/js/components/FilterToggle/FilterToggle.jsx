// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './FilterToggle.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterToggle = ({ variant, value, options, setter, icon = 'ArrowsVerticalIcon' }) => {
  const handleValueChange = () => {
    const otherOption = options.find((option) => option.value !== value);
    setter(otherOption.value);
  };

  const valueString = options.find((option) => option.value === value)?.label;

  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <button className={style.trigger} onClick={handleValueChange}>
        <span className={style.icon}>
          <Icon icon={icon} cover stroke />
        </span>
        <span className={style.label}>{valueString}</span>
      </button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FilterToggle;
