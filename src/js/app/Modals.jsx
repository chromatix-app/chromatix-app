// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { ModalWrap } from 'js/components';

import * as modals from 'js/modals';

// ======================================================================
// COMPONENT
// ======================================================================

const Modals = () => {
  const dispatch = useDispatch();
  const alertQueue = useSelector(({ dialogModel }) => dialogModel.alertQueue);
  const currentConfirmData = useSelector(({ dialogModel }) => dialogModel.currentConfirmData);
  const currentModal = useSelector(({ dialogModel }) => dialogModel.currentModal);

  const getComponent = () => {
    // alert
    if (alertQueue.length > 0) {
      return modals.Alert;
    }
    // confirm
    else if (currentConfirmData) {
      return modals.Confirmation;
    }
    // modal
    else if (currentModal && modals[currentModal]) {
      return modals[currentModal];
    }
    // default
    return null;
  };

  const closeCurrentModal = () => {
    // alert
    if (alertQueue.length > 0) {
      dispatch.dialogModel.closeAlert();
    }
    // confirm
    else if (currentConfirmData) {
      dispatch.dialogModel.closeConfirm();
    }
    // modal
    else {
      dispatch.dialogModel.closeModal();
    }
  };

  const ActualComponent = getComponent();

  if (ActualComponent) {
    return (
      <ModalWrap close={closeCurrentModal}>
        <ActualComponent />
      </ModalWrap>
    );
  } else {
    return null;
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default Modals;
