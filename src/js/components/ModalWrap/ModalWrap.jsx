// ======================================================================
// IMPORTS
// ======================================================================

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

import style from './ModalWrap.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const ModalWrap = ({ children, close, open = true }) => {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className={style.blackout} />
        <Dialog.Content className={clsx(style.center)} onPointerDownOutside={close}>
          <div className={style.overflow}>
            <div className={style.inner}>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ModalWrap;
