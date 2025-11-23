// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { Button, ViewServers, Loading, TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const LibraryArray = () => {
  const dispatch = useDispatch();

  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  return (
    <main className="wrap-inner">
      <div className="wrap-middle text-center">
        {!allLibraries && <Loading forceVisible inline />}
        {allLibraries && (
          <>
            <TitleBasic title={allLibraries.length > 0 ? 'Libraries' : 'No Libraries Available'} />
            <ViewServers variant="libraries" entries={allLibraries} />
            {allServers && allServers.length > 1 && (
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

export default LibraryArray;
