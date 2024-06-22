// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, Loading, TitleHeading } from 'js/components';
import { useGetAllAlbumCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const AlbumCollectionList = () => {
  const dispatch = useDispatch();

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
          <FilterSelect
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
          </>
        )}
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
