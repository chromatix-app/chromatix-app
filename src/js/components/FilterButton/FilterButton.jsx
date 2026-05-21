// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './FilterButton.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterButton = ({ variant, label, onClick, icon = 'ArrowsVerticalIcon' }) => {
  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <button className={style.trigger} onClick={onClick} aria-label={label}>
        <span className={style.icon}>
          <Icon icon={icon} cover stroke />
        </span>
        <span className={style.label}>{label}</span>
      </button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FilterButton;
