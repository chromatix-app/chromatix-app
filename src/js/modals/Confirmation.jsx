// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
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

  const [yesLoading, setYesLoading] = useState(false);
  const [noLoading, setNoLoading] = useState(false);

  const { icon, title, body, yesButton, yesCallback, noButton, noCallback, callbackData } = currentConfirmData;

  const doYes = async () => {
    if (yesCallback) {
      setYesLoading(true);
      try {
        await Promise.resolve(yesCallback(callbackData));
      } finally {
        setYesLoading(false);
      }
    }
    dispatch.dialogModel.closeConfirm();
  };

  const doNo = async () => {
    if (noCallback) {
      setNoLoading(true);
      try {
        await Promise.resolve(noCallback(callbackData));
      } finally {
        setNoLoading(false);
      }
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
            <Button onClick={doYes} size="small" color="mono" loading={yesLoading}>
              {yesButton}
            </Button>
          )}

          {noButton && (
            <Button onClick={doNo} size="small" color="tertiary" loading={noLoading}>
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
