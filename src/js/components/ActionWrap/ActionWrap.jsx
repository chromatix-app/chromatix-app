// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './ActionWrap.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const ActionWrap = ({ children, padding = false, inset = false }) => {
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

export default ActionWrap;
