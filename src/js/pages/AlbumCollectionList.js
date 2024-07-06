// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllAlbumCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const AlbumCollectionList = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewAlbumCollections, sortAlbumCollections, orderAlbumCollections, sortedAlbumCollections } =
    useGetAllAlbumCollections();

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
        {isLocal && (
          <FilterToggle
            value={viewAlbumCollections}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={(viewAlbumCollections) => {
              dispatch.sessionModel.setSessionState({
                viewAlbumCollections,
              });
            }}
            icon={viewAlbumCollections === 'grid' ? 'GridIcon' : 'ListIcon'}
          />
        )}
        {viewAlbumCollections === 'grid' && (
          <>
            <FilterSelect
              value={sortAlbumCollections}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={(sortAlbumCollections) => {
                dispatch.sessionModel.setSessionState({
                  sortAlbumCollections,
                });
              }}
            />
            <FilterToggle
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
              icon={orderAlbumCollections === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedAlbumCollections && <Loading forceVisible inline />}
      {sortedAlbumCollections && viewAlbumCollections === 'grid' && (
        <ListCards variant="collections" entries={sortedAlbumCollections} />
      )}
      {sortedAlbumCollections && viewAlbumCollections === 'list' && (
        <ListEntries
          variant="albumCollections"
          entries={sortedAlbumCollections}
          sortKey={sortAlbumCollections}
          orderKey={orderAlbumCollections}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionList;
