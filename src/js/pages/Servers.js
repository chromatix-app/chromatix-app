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

const Servers = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);

  useEffect(() => {
    plex.getAllServers();
  }, []);

  return (
    <main className="wrap-middle text-center">
      <div>
        {!allServers && <Loading forceVisible inline />}
        {allServers && (
          <>
            <TitleBasic title="Servers" />
            <ListServers entries={allServers} />
          </>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Servers;
