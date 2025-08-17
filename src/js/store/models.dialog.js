// ======================================================================
// STATE
// ======================================================================

const state = {
  alertQueue: [],
  currentConfirmData: null,
  currentModal: null,
  currentModalData: null,
};

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setDialogState(rootState, payload) {
    // console.log('%c--- setDialogState ---', 'color:#079189');
    return { ...rootState, ...payload };
  },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  //
  // ALERTS
  //

  showAlert(payload, rootState) {
    // OPTIONS
    // {
    //   icon,
    //   title,
    //   body,
    //   button,
    //   action,
    // }

    // create alert data
    const baseOptions = {
      button: 'Ok',
      action: () => {
        dispatch.dialogModel.closeAlert();
      },
    };
    const finalOptions = {
      ...baseOptions,
      ...payload,
    };

    // get alert queue
    let alertQueue = [...rootState.dialogModel.alertQueue];

    // check new alert isn't identical to last alert in queue
    let lastAlert = '';
    if (alertQueue.length > 0) {
      lastAlert = alertQueue[alertQueue.length - 1];
    }
    if (JSON.stringify(finalOptions) !== JSON.stringify(lastAlert)) {
      // add new alert to queue
      alertQueue.push(finalOptions);
      dispatch.dialogModel.setDialogState({
        alertQueue,
      });
    }
  },

  closeAlert(payload, rootState) {
    // get alert queue
    let alertQueue = [...rootState.dialogModel.alertQueue];

    // remove first item from queue
    alertQueue.shift();
    dispatch.dialogModel.setDialogState({
      alertQueue,
    });
  },

  //
  // CONFIRMATIONS
  //

  showConfirm(payload, rootState) {
    // OPTIONS
    // {
    //   icon,
    //   title,
    //   body,
    //   yesButton,
    //   yesCallback,
    //   noButton,
    //   noCallback,
    //   callbackData,
    // }

    // create confirm data
    const baseOptions = {
      yesButton: 'Ok',
      noButton: 'Cancel',
      yesCallback: (callbackData) => {
        dispatch.dialogModel.closeConfirm();
      },
      noCallback: (callbackData) => {
        dispatch.dialogModel.closeConfirm();
      },
    };
    const finalOptions = {
      ...baseOptions,
      ...payload,
    };

    dispatch.dialogModel.setDialogState({
      currentConfirmData: finalOptions,
    });
  },

  closeConfirm(payload, rootState) {
    dispatch.dialogModel.setDialogState({
      currentConfirmData: null,
    });
  },

  //
  // MODALS
  //

  showModal(payload, rootState) {
    if (typeof payload === 'object') {
      dispatch.dialogModel.setDialogState({
        currentModal: payload.modal,
        currentModalData: payload.data,
      });
    } else {
      dispatch.dialogModel.setDialogState({
        currentModal: payload,
        currentModalData: null,
      });
    }
  },

  closeModal(payload, rootState) {
    dispatch.dialogModel.setDialogState({
      currentModal: null,
      currentModalData: null,
    });
  },
});

// ======================================================================
// EXPORT
// ======================================================================

export const dialogModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
