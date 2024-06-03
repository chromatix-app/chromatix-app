// ======================================================================
// IMPORTS
// ======================================================================

import { TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const ErrorPlexGeneral = () => (
  <main className="wrap-inner">
    <div className="wrap-middle text-center">
      <TitleBasic title="Oops!" />
      <div className="mt-15"></div>
      Sorry, there was an error connecting to Plex.
      <br />
      Please try again later.
    </div>
  </main>
);

// ======================================================================
// EXPORT
// ======================================================================

export default ErrorPlexGeneral;
