// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionList = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewCollections, sortCollections, orderCollections, sortedCollections } =
    useGetAllCollections('ArtistCollections');

  return (
    <>
      <TitleHeading
        title="Artist Collections"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Artist Collection' + (sortedCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      <FilterWrap>
        <FilterToggle
          value={viewCollections}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={(viewCollections) => {
            dispatch.sessionModel.setSessionState({
              viewArtistCollections: viewCollections,
            });
          }}
          icon={viewCollections === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewCollections === 'grid' && (
          <>
            <FilterSelect
              value={sortCollections}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={(sortCollections) => {
                dispatch.sessionModel.setSessionState({
                  sortArtistCollections: sortCollections,
                });
              }}
            />
            <FilterToggle
              value={orderCollections}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={(orderCollections) => {
                dispatch.sessionModel.setSessionState({
                  orderArtistCollections: orderCollections,
                });
              }}
              icon={orderCollections === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedCollections && <Loading forceVisible inline />}
      {sortedCollections && viewCollections === 'grid' && (
        <ListCards variant="collections" entries={sortedCollections} />
      )}
      {sortedCollections && viewCollections === 'list' && (
        <ListEntries
          variant="artistCollections"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionList;
