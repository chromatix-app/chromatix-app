// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FilterWrap, ListCards, Loading, Select, TitleHeading } from 'js/components';
import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistList = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;
  const sortArtists = useSelector(({ sessionModel }) => sessionModel.sortArtists);
  const orderArtists = useSelector(({ sessionModel }) => sessionModel.orderArtists);

  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
  );
  const sortedArtists = allArtists ? sortList(allArtists, sortArtists, orderArtists) : null;

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artists"
        subtitle={sortedArtists ? sortedArtists?.length + ' Artist' + (sortedArtists?.length !== 1 ? 's' : '') : null}
      />
      <FilterWrap>
        <Select
          value={sortArtists}
          options={[
            { value: 'title', label: 'Alphabetical' },
            { value: 'userRating', label: 'Rating' },
            { value: 'addedAt', label: 'Recently Added' },
            { value: 'lastPlayed', label: 'Recently Played' },
          ]}
          setter={(sortArtists) => {
            dispatch.sessionModel.setSessionState({
              sortArtists,
            });
          }}
        />
        <Select
          value={orderArtists}
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          setter={(orderArtists) => {
            dispatch.sessionModel.setSessionState({
              orderArtists,
            });
          }}
        />
      </FilterWrap>
      {!sortedArtists && <Loading forceVisible inline />}
      {sortedArtists && <ListCards variant="artists" entries={sortedArtists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
