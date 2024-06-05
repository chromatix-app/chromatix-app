// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ListCards, Loading, Select, TitleHeading } from 'js/components';
import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionList = () => {
  const dispatch = useDispatch();

  const allArtistCollections = useSelector(({ appModel }) => appModel.allArtistCollections);
  const sortArtistCollections = useSelector(({ sessionModel }) => sessionModel.sortArtistCollections);

  const sortedArtistCollections = allArtistCollections ? sortList(allArtistCollections, sortArtistCollections) : null;

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artist Collections"
        subtitle={
          sortedArtistCollections ? (
            sortedArtistCollections?.length + ' Artist Collection' + (sortedArtistCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      <Select
        value={sortArtistCollections}
        options={[
          { value: 'title', label: 'Alphabetical' },
          { value: 'userRating', label: 'Rating' },
          { value: 'addedAt', label: 'Recently Added' },
        ]}
        setter={(sortArtistCollections) => {
          dispatch.sessionModel.setSessionState({
            sortArtistCollections,
          });
        }}
      />
      {!sortedArtistCollections && <Loading forceVisible inline />}
      {sortedArtistCollections && <ListCards variant="collections" entries={sortedArtistCollections} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionList;
