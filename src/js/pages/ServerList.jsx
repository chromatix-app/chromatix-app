// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListServers, Loading, TitleBasic } from 'js/components';
import * as bridge from 'js/services/bridge';

// ======================================================================
// COMPONENT
// ======================================================================

const ServerList = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);

  useEffect(() => {
    bridge.getAllServers();
  }, []);

  return (
    <main className="wrap-inner">
      <div className="wrap-middle text-center">
        {!allServers && <Loading forceVisible inline />}
        {allServers && (
          <>
            <TitleBasic title={allServers.length > 0 ? 'Servers' : 'No Servers Available'} />
            <ListServers variant="servers" entries={allServers} />
          </>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ServerList;
