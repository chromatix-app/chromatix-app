// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, Loading, TitleHeading } from 'js/components';
import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumCollectionList = () => {
  const dispatch = useDispatch();

  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);
  const sortAlbumCollections = useSelector(({ sessionModel }) => sessionModel.sortAlbumCollections);
  const orderAlbumCollections = useSelector(({ sessionModel }) => sessionModel.orderAlbumCollections);

  const sortedAlbumCollections = allAlbumCollections
    ? sortList(allAlbumCollections, sortAlbumCollections, orderAlbumCollections)
    : null;

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
      <FilterWrap>
        <FilterSelect
          value={sortAlbumCollections}
          options={[
            { value: 'title', label: 'Alphabetical' },
            { value: 'userRating', label: 'Rating' },
            { value: 'addedAt', label: 'Recently added' },
          ]}
          setter={(sortAlbumCollections) => {
            dispatch.sessionModel.setSessionState({
              sortAlbumCollections,
            });
          }}
        />
        <FilterSelect
          value={orderAlbumCollections}
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          setter={(orderAlbumCollections) => {
            dispatch.sessionModel.setSessionState({
              orderAlbumCollections,
            });
          }}
        />
      </FilterWrap>
      {!sortedAlbumCollections && <Loading forceVisible inline />}
      {sortedAlbumCollections && <ListCards variant="collections" entries={sortedAlbumCollections} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionList;
