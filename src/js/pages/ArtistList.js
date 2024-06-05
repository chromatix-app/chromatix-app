// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ListCards, Loading, Select, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const ArtistList = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const sortArtists = useSelector(({ sessionModel }) => sessionModel.sortArtists);

  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
  );
  const sortedArtists = allArtists ? sortArtistsArray(allArtists, sortArtists) : null;

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artists"
        subtitle={sortedArtists ? sortedArtists?.length + ' Artist' + (sortedArtists?.length !== 1 ? 's' : '') : null}
      />
      {isLocal && (
        <Select
          value={sortArtists}
          options={[
            { value: 'alphabetical', label: 'Alphabetical' },
            { value: 'rating', label: 'Rating' },
            { value: 'recentlyAdded', label: 'Recently Added' },
            { value: 'recentlyPlayed', label: 'Recently Played' },
          ]}
          setter={(sortArtists) => {
            dispatch.sessionModel.setSessionState({
              sortArtists,
            });
          }}
        />
      )}
      {!sortedArtists && <Loading forceVisible inline />}
      {sortedArtists && <ListCards variant="artists" entries={sortedArtists} />}
    </>
  );
};

const sortArtistsArray = (artists, sortKey) => {
  switch (sortKey) {
    case 'alphabetical':
      return artists.sort((a, b) => a.title?.localeCompare(b.title));
    case 'rating':
      return artists.sort((a, b) => (parseInt(b.userRating) || 0) - (parseInt(a.userRating) || 0));
    case 'recentlyAdded':
      return artists.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    case 'recentlyPlayed':
      return artists.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
    default:
      return artists;
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
