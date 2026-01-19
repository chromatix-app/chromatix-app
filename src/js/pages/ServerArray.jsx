// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { ViewServers, Loading, TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const ServerArray = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);

  return (
    <main className="wrap-inner">
      <div className="wrap-middle text-center">
        {!allServers && <Loading forceVisible inline />}
        {allServers && (
          <>
            <TitleBasic title={allServers.length > 0 ? 'Servers' : 'No Servers Available'} />
            <ViewServers variant="servers" entries={allServers} />
          </>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ServerArray;
