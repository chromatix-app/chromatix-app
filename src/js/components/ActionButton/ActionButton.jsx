// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './ActionButton.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const ActionButton = ({ variant, label, onClick, icon = 'ArrowsVerticalIcon' }) => {
  return (
    <div className={clsx(style.wrap, style['wrap' + variant])}>
      <button type="button" className={style.trigger} onClick={onClick} aria-label={label}>
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

export default ActionButton;
