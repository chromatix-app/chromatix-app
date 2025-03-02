// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, ListCards, ListTableV2, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionItems = () => {
  const { libraryId, collectionId } = useParams();

  const {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems,
    orderCollectionItems,

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,

    collectionThumb,
    collectionTitle,
    collectionRating,
  } = useGetCollectionItems({
    collectionId,
    libraryId,
    collectionKey: 'ArtistCollections',
    itemsKey: 'ArtistCollectionItems',
  });

  if (!collectionInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  const isLoading = !sortedCollectionItems;
  const isEmptyList = !isLoading && sortedCollectionItems?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollectionItems === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollectionItems === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          collectionId={collectionId}
          collectionRating={collectionRating}
          collectionThumb={collectionThumb}
          collectionTitle={collectionTitle}
          isListView={isListView}
          libraryId={libraryId}
          orderCollectionItems={orderCollectionItems}
          setOrderCollectionItems={setOrderCollectionItems}
          setSortCollectionItems={setSortCollectionItems}
          setViewCollectionItems={setViewCollectionItems}
          sortCollectionItems={sortCollectionItems}
          sortedCollectionItems={sortedCollectionItems}
          viewCollectionItems={viewCollectionItems}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && <ListCards variant={'artists'} entries={sortedCollectionItems} />}
      {isListView && (
        <ListTableV2
          variant="artistCollectionItems"
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
        >
          <Title
            collectionId={collectionId}
            collectionRating={collectionRating}
            collectionThumb={collectionThumb}
            collectionTitle={collectionTitle}
            isListView={isListView}
            libraryId={libraryId}
            orderCollectionItems={orderCollectionItems}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            viewCollectionItems={viewCollectionItems}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  collectionId,
  collectionRating,
  collectionThumb,
  collectionTitle,
  isListView,
  libraryId,
  orderCollectionItems,
  setOrderCollectionItems,
  setSortCollectionItems,
  setViewCollectionItems,
  sortCollectionItems,
  sortedCollectionItems,
  viewCollectionItems,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  return (
    <TitleHeading
      key={libraryId + '-' + collectionId}
      thumb={collectionThumb}
      title={collectionTitle}
      detail={
        optionShowStarRatings && (
          <StarRating
            variant="title"
            type="collection"
            ratingKey={collectionId}
            rating={collectionRating}
            editable
            alwaysVisible
          />
        )
      }
      subtitle={
        sortedCollectionItems ? (
          sortedCollectionItems?.length + ' Artist' + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      padding={!isListView}
      filters={
        <>
          <FilterToggle
            value={viewCollectionItems}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={setViewCollectionItems}
            icon={viewCollectionItems === 'grid' ? 'GridIcon' : 'ListIcon'}
          />
          {viewCollectionItems === 'grid' && (
            <>
              <FilterSelect
                value={sortCollectionItems}
                options={[
                  { value: 'title', label: 'Alphabetical' },
                  { value: 'addedAt', label: 'Date added' },
                  { value: 'lastPlayed', label: 'Date played' },
                  // only allow sorting by rating if the option is enabled
                  ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
                ]}
                setter={setSortCollectionItems}
              />
              <FilterToggle
                value={orderCollectionItems}
                options={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]}
                setter={setOrderCollectionItems}
                icon={orderCollectionItems === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
              />
            </>
          )}
        </>
      }
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionItems;
