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
  const alertQueue = useSelector(({ popupsModel }) => popupsModel.alertQueue);
  const currentConfirmData = useSelector(({ popupsModel }) => popupsModel.currentConfirmData);
  const currentModal = useSelector(({ popupsModel }) => popupsModel.currentModal);

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

  const closeCurrentModal = (event) => {
    event.preventDefault();
    if (event.target === event.currentTarget) {
      // alert
      if (alertQueue.length > 0) {
        dispatch.popupsModel.closeAlert();
      }
      // confirm
      else if (currentConfirmData) {
        dispatch.popupsModel.closeConfirm();
      }
      // modal
      else {
        dispatch.popupsModel.closeModal();
      }
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
