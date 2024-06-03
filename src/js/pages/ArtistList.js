// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListCards, Loading, Select, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const ArtistList = () => {
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
  );

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artists"
        subtitle={allArtists ? allArtists?.length + ' Artist' + (allArtists?.length !== 1 ? 's' : '') : null}
      />
      {isLocal && <Select />}
      {!allArtists && <Loading forceVisible inline />}
      {allArtists && <ListCards variant="artists" entries={allArtists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
