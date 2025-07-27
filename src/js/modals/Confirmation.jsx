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

  const modalTheme = currentConfirmData.theme ? currentConfirmData.theme : undefined;
  const callbackData = currentConfirmData.callbackData ? currentConfirmData.callbackData : null;

  let btnColor;
  if (modalTheme === 'warnRed' || modalTheme === 'warnRedBorder') {
    btnColor = 'redBtn';
  } else if (modalTheme === 'warnOrangeBorder') {
    btnColor = 'orangeBtn';
  }

  const doYes = () => {
    if (currentConfirmData.yesCallback) {
      currentConfirmData.yesCallback(callbackData);
    }
    dispatch.dialogModel.closeConfirm();
  };

  const doNo = () => {
    if (currentConfirmData.noCallback) {
      currentConfirmData.noCallback(callbackData);
    }
    dispatch.dialogModel.closeConfirm();
  };

  return (
    <ModalWindow theme={modalTheme}>
      {currentConfirmData.title && (
        <Dialog.Title asChild>
          <h1 className={style.title}>{currentConfirmData.title}</h1>
        </Dialog.Title>
      )}

      {currentConfirmData.body && (
        <Dialog.Description asChild>
          <div className={style.body}>{currentConfirmData.body}</div>
        </Dialog.Description>
      )}

      {(currentConfirmData.yesButton || currentConfirmData.noButton) && (
        <div className={style.buttons}>
          {currentConfirmData.yesButton && (
            <Button onClick={doYes} color={btnColor} size="modal" spacer="">
              {currentConfirmData.yesButton}
            </Button>
          )}

          {currentConfirmData.noButton && (
            <Button onClick={doNo} color="greyBtn" size="modal" spacer="">
              {currentConfirmData.noButton}
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
