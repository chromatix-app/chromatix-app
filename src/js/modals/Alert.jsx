// ======================================================================
// IMPORTS
// ======================================================================

// import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { Button, ModalWindow } from 'js/components';
// import { useKeyEsc } from 'js/hooks';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Alert = () => {
  const focusRef = useRef(null);
  const alertQueue = useSelector(({ popupsModel }) => popupsModel.alertQueue);

  const alert = alertQueue[0];
  const modalTheme = alert.theme ? alert.theme : undefined;
  const btnAction = alert.action ? alert.action : null;

  let btnColor;
  if (modalTheme === 'warnRed' || modalTheme === 'warnRedBorder') {
    btnColor = 'redBtn';
  } else if (modalTheme === 'warnOrangeBorder') {
    btnColor = 'orangeBtn';
  }

  // focus on load
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, [focusRef]);

  // // close on escape key
  // useKeyEsc(dispatch.popupsModel.closeAlert);

  return (
    <ModalWindow theme={modalTheme}>
      {alert.prefix && <div className={style.prefix}>{alert.prefix}</div>}
      {alert.title && <div className={style.title}>{alert.title}</div>}
      {alert.body && <div className={style.body}>{alert.body}</div>}

      <div className={style.buttons}>
        <Button ref={focusRef} size="modal" color={btnColor} onClick={btnAction} spacer="">
          {alert.button}
        </Button>
      </div>
    </ModalWindow>
  );
};

// ======================================================================
// PROPTYPES
// ======================================================================

// Alert.propTypes = {
//   alertQueue: PropTypes.array.isRequired,
// };

// ======================================================================
// EXPORT
// ======================================================================

export default Alert;
