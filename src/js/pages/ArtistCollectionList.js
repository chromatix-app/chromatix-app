// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllArtistCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const ArtistCollectionList = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewArtistCollections, sortArtistCollections, orderArtistCollections, sortedArtistCollections } =
    useGetAllArtistCollections();

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
      <FilterWrap>
        {isLocal && (
          <FilterSelect
            value={viewArtistCollections}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={(viewArtistCollections) => {
              dispatch.sessionModel.setSessionState({
                viewArtistCollections,
              });
            }}
            icon={viewArtistCollections === 'grid' ? 'GridIcon' : 'ListIcon'}
          />
        )}
        {viewArtistCollections === 'grid' && (
          <>
            <FilterSelect
              value={sortArtistCollections}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={(sortArtistCollections) => {
                dispatch.sessionModel.setSessionState({
                  sortArtistCollections,
                });
              }}
            />
            <FilterSelect
              value={orderArtistCollections}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={(orderArtistCollections) => {
                dispatch.sessionModel.setSessionState({
                  orderArtistCollections,
                });
              }}
            />
          </>
        )}
      </FilterWrap>
      {!sortedArtistCollections && <Loading forceVisible inline />}
      {sortedArtistCollections && viewArtistCollections === 'grid' && (
        <ListCards variant="collections" entries={sortedArtistCollections} />
      )}
      {sortedArtistCollections && viewArtistCollections === 'list' && (
        <ListEntries
          variant="artistCollections"
          entries={sortedArtistCollections}
          sortKey={sortArtistCollections}
          orderKey={orderArtistCollections}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionList;
