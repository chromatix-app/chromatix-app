// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import * as Dialog from '@radix-ui/react-dialog';

import { Button, ModalWindow } from 'js/components';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Alert = () => {
  const alertQueue = useSelector(({ dialogModel }) => dialogModel.alertQueue);

  const alert = alertQueue[0];
  const modalTheme = alert.theme ? alert.theme : undefined;
  const btnAction = alert.action ? alert.action : null;

  let btnColor;
  if (modalTheme === 'warnRed' || modalTheme === 'warnRedBorder') {
    btnColor = 'redBtn';
  } else if (modalTheme === 'warnOrangeBorder') {
    btnColor = 'orangeBtn';
  }

  return (
    <ModalWindow theme={modalTheme}>
      {alert.title && (
        <Dialog.Title asChild>
          <h1 className={style.title}>{alert.title}</h1>
        </Dialog.Title>
      )}

      {alert.body && (
        <Dialog.Description asChild>
          <div className={style.body}>{alert.body}</div>
        </Dialog.Description>
      )}

      <div className={style.buttons}>
        <Button size="modal" color={btnColor} onClick={btnAction} spacer="">
          {alert.button}
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Alert;
