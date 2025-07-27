// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';
// import { motion } from 'framer-motion';

import { Icon } from 'js/components';
import style from './ModalWindow.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const ModalWindow = ({ children, icon, variant }) => {
  return (
    <div
      className={clsx(style.modal, style[variant])}
      // initial={{ opacity: 0, scale: 0.8 }}
      // animate={{ opacity: 1, scale: 1 }}
      // transition={{ duration: 0.15 }}
    >
      {icon && (
        <div className={style.icon}>
          <Icon icon={icon} cover stroke strokeWidth={2} />
        </div>
      )}
      <div className={style.main}>{children}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ModalWindow;
