// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, ViewServers, Loading, TitleBasic } from 'js/components';
import * as bridge from 'js/services/bridge';

// ======================================================================
// COMPONENT
// ======================================================================

const LibraryList = () => {
  const dispatch = useDispatch();

  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  useEffect(() => {
    bridge.getAllLibraries();
  }, []);

  return (
    <main className="wrap-inner">
      <div className="wrap-middle text-center">
        {!allLibraries && <Loading forceVisible inline />}
        {allLibraries && (
          <>
            <TitleBasic title={allLibraries.length > 0 ? 'Libraries' : 'No Libraries Available'} />
            <ViewServers variant="libraries" entries={allLibraries} />
            <Button onClick={dispatch.sessionModel.unsetCurrentServer}>Back to Servers</Button>
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
