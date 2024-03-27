// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Loading, Title } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';
const plexServerProtocol = isProduction ? 'https://' : 'http://';

const Servers = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);

  useEffect(() => {
    plex.getAllServers();
  }, []);

  return (
    <>
      <Title title="Servers" subtitle={allServers?.length ? allServers?.length + ' Servers' : null} />
      {!allServers && <Loading forceVisible inline />}
      {allServers &&
        allServers.map((server, index) => (
          <div key={index}>
            {server.name}
            <br />
            {plexServerProtocol}
            {server.host}:{server.port}
          </div>
        ))}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Servers;
