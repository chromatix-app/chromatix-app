// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { Button, TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const ErrorPlexLogin = () => {
  const dispatch = useDispatch();

  return (
    <main className="wrap-middle text-center">
      <div>
        <TitleBasic title="Oops!" />
        <div className="mt-15"></div>
        Sorry, there was an error connecting to Plex.
        <br />
        Please try again later.
        <div className="mt-50"></div>
        <Button className="btn btn-primary" onClick={dispatch.appModel.dismissPlexErrorLogin}>
          Ok
        </Button>
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ErrorPlexLogin;
