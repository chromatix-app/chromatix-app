// ======================================================================
// IMPORTS
// ======================================================================

import PropTypes from 'prop-types';
import clsx from 'clsx';
// import { motion } from 'framer-motion';

import { Icon } from 'js/components';
import style from './ModalWindow.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const ModalWindow = ({ children, theme, variant }) => {
  let icon = null;

  if (theme === 'success') {
    icon = <Icon family="octicons" icon="CheckCircleIcon" cover />;
  } else if (theme === 'error') {
    icon = <Icon family="octicons" icon="XCircleIcon" cover />;
  } else if (
    theme === 'warnOrange' ||
    theme === 'warnOrangeBorder' ||
    theme === 'warnRed' ||
    theme === 'warnRedBorder'
  ) {
    icon = <Icon family="octicons" icon="AlertIcon" cover />;
  } else if (theme === 'release') {
    icon = <Icon family="octicons" icon="RocketIcon" cover />;
  }

  return (
    <div
      key={alert.title}
      className={clsx('modal', style.modal, style[theme], style[variant])}
      // initial={{ opacity: 0, scale: 0.8 }}
      // animate={{ opacity: 1, scale: 1 }}
      // transition={{ duration: 0.15 }}
    >
      {icon && <div className={style.icon}>{icon}</div>}
      <div className={style.main}>{children}</div>
    </div>
  );
};

// ======================================================================
// PROPTYPES
// ======================================================================

ModalWindow.propTypes = {
  children: PropTypes.node.isRequired,
  theme: PropTypes.string,
  variant: PropTypes.string,
};

// ======================================================================
// EXPORT
// ======================================================================

export default ModalWindow;
