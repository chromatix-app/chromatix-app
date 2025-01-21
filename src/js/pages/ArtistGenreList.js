// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListCards, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistGenreList = () => {
  const allArtistGenres = useSelector(({ appModel }) => appModel.allArtistGenres);

  useEffect(() => {
    plex.getAllArtistGenres();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artist Genres"
        subtitle={
          allArtistGenres ? (
            allArtistGenres?.length + ' Artist Genre' + (allArtistGenres?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allArtistGenres && <Loading forceVisible inline />}
      {allArtistGenres && <ListCards variant="artistGenres" entries={allArtistGenres} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistGenreList;
