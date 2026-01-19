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
  const currentAlert = alertQueue[0];

  if (!currentAlert) return null;

  const { icon, title, body, button, action } = currentAlert;

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

      <div className={style.buttons}>
        <Button size="small" color="mono" onClick={action}>
          {button}
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Alert;
