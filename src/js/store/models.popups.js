// ======================================================================
// STATE
// ======================================================================

const state = {
  // modal
  currentModal: null,
  currentModalData: null,
  currentConfirmData: null,
  alertQueue: [],
};

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setState(rootState, payload) {
    // console.log('%c--- setState ---', 'color:#079189');
    return { ...rootState, ...payload };
  },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  // ====================
  // MODALS
  // ====================

  showModal(payload, rootState) {
    if (typeof payload === 'object') {
      dispatch.popupsModel.setState({
        currentModal: payload.modal,
        currentModalData: payload.data,
      });
    } else {
      dispatch.popupsModel.setState({
        currentModal: payload,
        currentModalData: null,
      });
    }
  },

  closeModal(payload, rootState) {
    dispatch.popupsModel.setState({
      currentModal: null,
      currentModalData: null,
    });
  },

  showAlert(payload, rootState) {
    // OPTIONS
    // {
    //   theme
    //   prefix
    //   title
    //   body
    //   button
    //   action
    // }

    // create alert data
    const baseOptions = {
      button: 'Ok',
      action: () => {
        dispatch.popupsModel.closeAlert();
      },
    };
    const finalOptions = {
      ...baseOptions,
      ...payload,
    };

    // get alert queue
    let alertQueue = [...rootState.popupsModel.alertQueue];

    // check new alert isn't identical to last alert in queue
    let lastAlert = '';
    if (alertQueue.length > 0) {
      lastAlert = alertQueue[alertQueue.length - 1];
    }
    if (JSON.stringify(finalOptions) !== JSON.stringify(lastAlert)) {
      // add new alert to queue
      alertQueue.push(finalOptions);
      dispatch.popupsModel.setState({
        alertQueue,
      });
    }
  },

  closeAlert(payload, rootState) {
    // get alert queue
    let alertQueue = [...rootState.popupsModel.alertQueue];

    // remove first item from queue
    alertQueue.shift();
    dispatch.popupsModel.setState({
      alertQueue,
    });
  },

  showConfirm(payload, rootState) {
    // OPTIONS
    // {
    //   theme
    //   prefix
    //   title
    //   body
    //   yesButton
    //   yesCallback
    //   noButton
    //   noCallback
    //   callbackData
    // }

    // create confirm data
    const baseOptions = {
      yesButton: 'Ok',
      noButton: 'Cancel',
      yesCallback: (callbackData) => {
        dispatch.popupsModel.closeConfirm();
      },
      noCallback: (callbackData) => {
        dispatch.popupsModel.closeConfirm();
      },
    };
    const finalOptions = {
      ...baseOptions,
      ...payload,
    };

    dispatch.popupsModel.setState({
      currentConfirmData: finalOptions,
    });
  },

  closeConfirm(payload, rootState) {
    dispatch.popupsModel.setState({
      currentConfirmData: null,
    });
  },
});

// ======================================================================
// EXPORT
// ======================================================================

export const popupsModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // selectors - handle state changed based on other state properties
  // selectors,
  // effects - handle state changes with impure functions
  // (use async/await for async actions)
  effects,
};
