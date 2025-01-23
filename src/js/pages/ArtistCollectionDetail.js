// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, ListCards, ListEntries, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionDetail = () => {
  const dispatch = useDispatch();

  const { collectionId, libraryId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const {
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems,
    orderCollectionItems,

    collectionThumb,
    collectionTitle,
    collectionRating,
  } = useGetCollectionItems({
    collectionId,
    libraryId,
    collectionKey: 'ArtistCollections',
    itemsKey: 'ArtistCollectionItems',
  });

  return (
    <>
      {sortedCollectionItems && (
        <TitleHeading
          thumb={collectionThumb}
          title={collectionTitle}
          detail={
            optionShowStarRatings && (
              <StarRating
                type="collection"
                ratingKey={collectionId}
                rating={collectionRating}
                inline
                editable
                alwaysVisible
              />
            )
          }
          subtitle={sortedCollectionItems?.length + ' Artist' + (sortedCollectionItems?.length !== 1 ? 's' : '')}
          filters={
            <>
              <FilterToggle
                value={viewCollectionItems}
                options={[
                  { value: 'grid', label: 'Grid view' },
                  { value: 'list', label: 'List view' },
                ]}
                setter={(viewCollectionItems) => {
                  dispatch.sessionModel.setSessionState({
                    viewArtistCollectionItems: viewCollectionItems,
                  });
                }}
                icon={viewCollectionItems === 'grid' ? 'GridIcon' : 'ListIcon'}
              />
              {viewCollectionItems === 'grid' && (
                <>
                  <FilterSelect
                    value={sortCollectionItems}
                    options={[
                      { value: 'title', label: 'Alphabetical' },
                      { value: 'artist', label: 'Artist' },
                      // only allow sub-sorting in grid view
                      ...(viewCollectionItems === 'grid'
                        ? [
                            { value: 'artist-asc-releaseDate-asc', label: 'Artist, newest release first' },
                            { value: 'artist-asc-releaseDate-desc', label: 'Artist, oldest release first' },
                          ]
                        : []),
                      { value: 'addedAt', label: 'Date added' },
                      { value: 'lastPlayed', label: 'Date played' },
                      { value: 'releaseDate', label: 'Date released' },
                      // only allow sorting by rating if the option is enabled
                      ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
                    ]}
                    setter={(sortCollectionItems) => {
                      dispatch.sessionModel.setSessionState({
                        sortArtistCollectionItems: sortCollectionItems,
                      });
                    }}
                  />
                  <FilterToggle
                    value={orderCollectionItems}
                    options={[
                      { value: 'asc', label: 'Ascending' },
                      { value: 'desc', label: 'Descending' },
                    ]}
                    setter={(orderCollectionItems) => {
                      dispatch.sessionModel.setSessionState({
                        orderArtistCollectionItems: orderCollectionItems,
                      });
                    }}
                    icon={orderCollectionItems === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
                  />
                </>
              )}
            </>
          }
        />
      )}
      {!sortedCollectionItems && <Loading forceVisible inline />}
      {sortedCollectionItems && viewCollectionItems === 'grid' && (
        <ListCards variant={'artists'} entries={sortedCollectionItems} />
      )}
      {sortedCollectionItems && viewCollectionItems === 'list' && (
        <ListEntries
          variant="artistCollectionItems"
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionDetail;
