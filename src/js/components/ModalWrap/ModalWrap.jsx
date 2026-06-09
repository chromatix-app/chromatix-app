// ======================================================================
// IMPORTS
// ======================================================================

import { useLayoutEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';

import { useWindowSize } from 'js/hooks';

import style from './ModalWrap.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const ModalWrap = ({ children, close, open = true }) => {
  const modalRef = useRef(null);
  const { windowWidth, windowHeight } = useWindowSize();
  const [hasOverflow, setHasOverflow] = useState(false);

  useLayoutEffect(() => {
    if (modalRef.current) {
      setHasOverflow(modalRef.current.scrollHeight > modalRef.current.clientHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowWidth, windowHeight]);

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className={style.blackout} />
        <Dialog.Content
          className={clsx(style.center, { [style.centerWithOverflow]: hasOverflow })}
          onPointerDownOutside={close}
        >
          <div ref={modalRef} className={style.overflow}>
            {children}
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
