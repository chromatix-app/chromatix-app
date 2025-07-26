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
            dispatch.popupsModel.showAlert({
              theme: 'warnRed',
              prefix: 'Alert Prefix',
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
            dispatch.popupsModel.showConfirm({
              theme: 'warnRed',
              prefix: 'Alert Prefix',
              title: 'Alert Title',
              body: 'This is the body of the alert.',
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
            dispatch.popupsModel.showModal('ReleaseNotes');
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
