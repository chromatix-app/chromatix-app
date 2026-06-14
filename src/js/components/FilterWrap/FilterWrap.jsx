// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './FilterWrap.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FilterWrap = ({ children, padding = false, nested = false }) => {
  return (
    <div
      className={clsx(style.wrap, {
        [style.padding]: padding,
        [style.nested]: nested,
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
