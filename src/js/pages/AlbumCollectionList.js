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

const AlbumCollectionList = () => {
  const dispatch = useDispatch();

  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);
  const sortAlbumCollections = useSelector(({ sessionModel }) => sessionModel.sortAlbumCollections);

  const sortedAlbumCollections = allAlbumCollections ? sortList(allAlbumCollections, sortAlbumCollections) : null;

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return (
    <>
      <TitleHeading
        title="Album Collections"
        subtitle={
          sortedAlbumCollections ? (
            sortedAlbumCollections?.length + ' Album Collection' + (sortedAlbumCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      <Select
        value={sortAlbumCollections}
        options={[
          { value: 'title', label: 'Alphabetical' },
          { value: 'userRating', label: 'Rating' },
          { value: 'addedAt', label: 'Recently Added' },
        ]}
        setter={(sortAlbumCollections) => {
          dispatch.sessionModel.setSessionState({
            sortAlbumCollections,
          });
        }}
      />
      {!sortedAlbumCollections && <Loading forceVisible inline />}
      {sortedAlbumCollections && <ListCards variant="collections" entries={sortedAlbumCollections} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionList;
