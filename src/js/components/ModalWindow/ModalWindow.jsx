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
  const variantClassName = 'wrap' + variant?.charAt(0).toUpperCase() + variant?.slice(1);

  return (
    <div
      className={clsx(style.wrap, style[variantClassName])}
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
