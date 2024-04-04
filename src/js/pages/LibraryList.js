// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, ListServers, Loading, TitleBasic } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const LibraryList = () => {
  const dispatch = useDispatch();

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
            <TitleBasic title={allLibraries.length > 0 ? 'Libraries' : 'No Libraries Available'} />
            <ListServers variant="libraries" entries={allLibraries} />
            {allLibraries.length < 1 && (
              <Button onClick={dispatch.sessionModel.unsetCurrentServer}>Back to Servers</Button>
            )}
          </>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default LibraryList;
