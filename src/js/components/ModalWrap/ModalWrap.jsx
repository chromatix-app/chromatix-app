// ======================================================================
// IMPORTS
// ======================================================================

import PropTypes from 'prop-types';
// import { motion } from 'framer-motion';
import clsx from 'clsx';

import style from './ModalWrap.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const ModalWrap = ({ children, close }) => {
  return (
    <div className={style.wrap}>
      <div
        className={style.blackout}
        onClick={close}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // transition={{ duration: 0.15 }}
      ></div>
      <div className={clsx(style.center)}>
        <div className={style.overflow}>
          {/* onClick={close}> */}
          <aside role="dialog" className={style.inner}>
            {/* onClick={close}> */}
            {children}
          </aside>
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// PROPTYPES
// ======================================================================

ModalWrap.propTypes = {
  children: PropTypes.node.isRequired,
  close: PropTypes.func.isRequired,
};

// ======================================================================
// EXPORT
// ======================================================================

export default ModalWrap;
