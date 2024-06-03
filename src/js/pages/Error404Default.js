// ======================================================================
// IMPORTS
// ======================================================================

import { Button, TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Error404Default = () => (
  <main className="wrap-inner">
    <div className="wrap-middle text-center">
      <TitleBasic title="404 Not Found" />
      <div className="mt-20"></div>
      <Button to={'/'}>Home</Button>
    </div>
  </main>
);

// ======================================================================
// EXPORT
// ======================================================================

export default Error404Default;
