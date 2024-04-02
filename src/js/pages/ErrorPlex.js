// ======================================================================
// IMPORTS
// ======================================================================

import { TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Error404Plex = () => (
  <main className="wrap-middle text-center">
    <div>
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

export default Error404Plex;
