// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './FilterWrap.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterWrap = ({ children, padding = false, inset = false }) => {
  return (
    <div
      className={clsx(style.wrap, {
        [style.padding]: padding,
        [style.inset]: inset,
      })}
    >
      {children}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FilterWrap;
