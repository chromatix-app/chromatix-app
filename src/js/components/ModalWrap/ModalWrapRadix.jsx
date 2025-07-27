// ======================================================================
// IMPORTS
// ======================================================================

import PropTypes from 'prop-types';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

import style from './ModalWrap.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const ModalWrapRadix = ({ children, close, open = true }) => {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className={style.blackout} />
        <Dialog.Content className={clsx(style.center)} onPointerDownOutside={close}>
          <div className={style.overflow}>
            <aside role="dialog" className={style.inner}>
              {children}
            </aside>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ======================================================================
// PROPTYPES
// ======================================================================

ModalWrapRadix.propTypes = {
  children: PropTypes.node.isRequired,
  close: PropTypes.func.isRequired,
  open: PropTypes.bool,
};

// ======================================================================
// EXPORT
// ======================================================================

export default ModalWrapRadix;
