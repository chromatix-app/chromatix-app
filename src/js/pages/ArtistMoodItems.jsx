// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { FilterMenu, FilterSelect, FilterToggle, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistMoodItems = () => {
  const { libraryId, moodId } = useParams();

  const {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems,
    orderCollectionItems,
    gridOptions,
    colOptions,

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,
    setColumnVisibility,

    collectionThumb,
    collectionTitle,
  } = useGetCollectionItems({
    libraryId,
    collectionId: moodId,
    collectionFilter: 'moodId',
    collectionKey: 'ArtistMoods',
    itemsKey: 'ArtistMoodItems',
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
      {(isLoading || isEmptyList) && (
        <Title
          collectionThumb={collectionThumb}
          collectionTitle={collectionTitle}
          colOptions={colOptions}
          gridOptions={gridOptions}
          isGridView={isGridView}
          isListView={isListView}
          libraryId={libraryId}
          moodId={moodId}
          orderCollectionItems={orderCollectionItems}
          setColumnVisibility={setColumnVisibility}
          setOrderCollectionItems={setOrderCollectionItems}
          setSortCollectionItems={setSortCollectionItems}
          setViewCollectionItems={setViewCollectionItems}
          sortCollectionItems={sortCollectionItems}
          sortedCollectionItems={sortedCollectionItems}
          viewCollectionItems={viewCollectionItems}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ListCards
          variant="artists"
          entries={sortedCollectionItems}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          <Title
            collectionThumb={collectionThumb}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            libraryId={libraryId}
            moodId={moodId}
            orderCollectionItems={orderCollectionItems}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            viewCollectionItems={viewCollectionItems}
          />
        </ListCards>
      )}
      {isListView && (
        <ListTable
          variant="artistMoodItems"
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
          colOptions={colOptions}
        >
          <Title
            collectionThumb={collectionThumb}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            libraryId={libraryId}
            moodId={moodId}
            orderCollectionItems={orderCollectionItems}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            viewCollectionItems={viewCollectionItems}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  collectionThumb,
  collectionTitle,
  colOptions,
  gridOptions,
  isGridView,
  isListView,
  libraryId,
  moodId,
  orderCollectionItems,
  setColumnVisibility,
  setOrderCollectionItems,
  setSortCollectionItems,
  setViewCollectionItems,
  sortCollectionItems,
  sortedCollectionItems,
  viewCollectionItems,
}) => {
  return (
    <TitleHeading
      key={libraryId + '-' + moodId}
      thumb={collectionThumb}
      title={collectionTitle}
      subtitle={
        sortedCollectionItems ? (
          sortedCollectionItems?.length + ' Artist' + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      icon={'ArtistMoodsIcon'}
      padding={!isListView && !isGridView}
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
                  { value: 'userRating', label: 'Rating' },
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
              <FilterMenu
                label="Options"
                icon="CogIcon"
                setter={setColumnVisibility}
                entries={[
                  {
                    label: 'Show star ratings',
                    attr: 'gridArtistCollectionItemsUserRating',
                    checked: gridOptions.userRating,
                  },
                  {
                    label: 'Show favourites',
                    attr: 'gridArtistCollectionItemsIsFavourite',
                    checked: gridOptions.isFavourite,
                  },
                ]}
              />
            </>
          )}
          {viewCollectionItems === 'list' && (
            <FilterMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  label: 'Title',
                  disabled: true,
                  checked: true,
                },
                {
                  label: 'Genre',
                  attr: 'colCollectionArtistsGenre',
                  checked: colOptions.genre,
                },
                {
                  label: 'Added',
                  attr: 'colCollectionArtistsAddedAt',
                  checked: colOptions.addedAt,
                },
                {
                  label: 'Last played',
                  attr: 'colCollectionArtistsLastPlayed',
                  checked: colOptions.lastPlayed,
                },
                {
                  label: 'Rating',
                  attr: 'colCollectionArtistsUserRating',
                  checked: colOptions.userRating,
                },
              ]}
            />
          )}
        </>
      }
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistMoodItems;
