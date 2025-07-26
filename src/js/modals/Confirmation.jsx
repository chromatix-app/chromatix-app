// ======================================================================
// IMPORTS
// ======================================================================

// import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import clsx from 'clsx';

import { Button, ModalWindow } from 'js/components';
// import { useKeyEsc } from 'js/hooks';
import style from './modals.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Confirmation = () => {
  const focusRef = useRef(null);
  const dispatch = useDispatch();
  const currentConfirmData = useSelector(({ popupsModel }) => popupsModel.currentConfirmData);

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
    dispatch.popupsModel.closeConfirm();
  };

  const doNo = () => {
    if (currentConfirmData.noCallback) {
      currentConfirmData.noCallback(callbackData);
    }
    dispatch.popupsModel.closeConfirm();
  };

  // focus on load
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, [focusRef]);

  // // close on escape key
  // useKeyEsc(doNo);

  return (
    <ModalWindow theme={modalTheme}>
      {currentConfirmData.prefix && <div className={style.prefix}>{currentConfirmData.prefix}</div>}
      {currentConfirmData.title && <div className={style.title}>{currentConfirmData.title}</div>}
      {currentConfirmData.body && <div className={style.body}>{currentConfirmData.body}</div>}

      {(currentConfirmData.yesButton || currentConfirmData.noButton) && (
        <div className={style.buttons}>
          {currentConfirmData.yesButton && (
            <Button ref={focusRef} onClick={doYes} color={btnColor} size="modal" spacer="">
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
// PROPTYPES
// ======================================================================

// Confirmation.propTypes = {
//   currentConfirmData: PropTypes.object.isRequired,
// };

// ======================================================================
// EXPORT
// ======================================================================

export default Confirmation;
