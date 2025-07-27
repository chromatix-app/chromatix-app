// ======================================================================
// IMPORTS
// ======================================================================

import { Button, PageText, TitleHeading } from 'js/components';
import { useDispatch } from 'react-redux';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  const dispatch = useDispatch();

  return (
    <>
      <TitleHeading title="Modals" />
      <PageText fontSize="small" wysiwyg={false}>
        <Button
          size="small"
          onClick={() => {
            dispatch.dialogModel.showAlert({
              // icon: 'CheckCircleCheckedIcon',
              theme: 'warnRed',
              title: 'Alert Title',
              body: 'This is the body of the alert.',
              // button: 'Close',
              // action: () => {
              //   console.log('Alert closed');
              // },
            });
          }}
        >
          Alert
        </Button>

        <br />

        <Button
          size="small"
          onClick={() => {
            dispatch.dialogModel.showAlert({
              icon: 'InfoIcon',
              theme: 'warnRed',
              title: 'Alert Title',
              body: 'This is the body of the alert.',
              // button: 'Close',
              // action: () => {
              //   console.log('Alert closed');
              // },
            });
          }}
        >
          Alert - Info
        </Button>

        <br />

        <Button
          size="small"
          onClick={() => {
            dispatch.dialogModel.showAlert({
              icon: 'CheckCircleCheckedIcon',
              theme: 'warnRed',
              title: 'Alert Title',
              body: 'This is the body of the alert.',
              // button: 'Close',
              // action: () => {
              //   console.log('Alert closed');
              // },
            });
          }}
        >
          Alert - Success
        </Button>

        <br />

        <Button
          size="small"
          onClick={() => {
            dispatch.dialogModel.showConfirm({
              theme: 'warnRed',
              title: 'Confirmation Title',
              body: 'This is the body of the confirmation.',
              // yesButton: 'Yes',
              // noButton: 'No',
              // yesCallback: () => {
              //   console.log('Yes clicked');
              // },
              // noCallback: () => {
              //   console.log('No clicked');
              // },
            });
          }}
        >
          Confirmation
        </Button>

        <br />

        <Button
          size="small"
          onClick={() => {
            dispatch.dialogModel.showModal('ReleaseNotes');
          }}
        >
          Release Notes
        </Button>
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
