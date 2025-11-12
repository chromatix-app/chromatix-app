// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';
// import clsx from 'clsx';

import { Button, ModalWindow } from 'js/components';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Confirmation = () => {
  const dispatch = useDispatch();
  const currentConfirmData = useSelector(({ dialogModel }) => dialogModel.currentConfirmData);

  const { icon, title, body, yesButton, yesCallback, noButton, noCallback, callbackData } = currentConfirmData;

  const doYes = () => {
    if (yesCallback) {
      yesCallback(callbackData);
    }
    dispatch.dialogModel.closeConfirm();
  };

  const doNo = () => {
    if (noCallback) {
      noCallback(callbackData);
    }
    dispatch.dialogModel.closeConfirm();
  };

  return (
    <ModalWindow icon={icon}>
      {title && (
        <Dialog.Title asChild>
          <h1 className={style.title}>{title}</h1>
        </Dialog.Title>
      )}

      {body && (
        <Dialog.Description asChild>
          <div className={style.body}>{body}</div>
        </Dialog.Description>
      )}

      {(yesButton || noButton) && (
        <div className={style.buttons}>
          {yesButton && (
            <Button onClick={doYes} size="modal" color="mono">
              {yesButton}
            </Button>
          )}

          {noButton && (
            <Button onClick={doNo} size="modal" color="tertiary">
              {noButton}
            </Button>
          )}
        </div>
      )}
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Confirmation;
