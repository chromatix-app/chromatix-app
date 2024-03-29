// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListServers, Loading, TitleBasic } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const Libraries = () => {
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  useEffect(() => {
    plex.getAllLibraries();
  }, []);

  return (
    <main className="wrap-middle text-center">
      <div>
        {!allLibraries && <Loading forceVisible inline />}
        {allLibraries && (
          <>
            <TitleBasic title="Libraries" />
            <ListServers variant="libraries" entries={allLibraries} />
          </>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Libraries;
