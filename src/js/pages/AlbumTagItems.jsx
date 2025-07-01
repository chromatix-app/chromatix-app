// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { FilterMenu, FilterSelect, FilterToggle, ViewGrid, ViewList, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumTagItems = () => {
  const { libraryId, tagId } = useParams();

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
    collectionId: tagId,
    collectionFilter: 'tagId',
    collectionKey: 'AlbumTags',
    itemsKey: 'AlbumTagItems',
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
          orderCollectionItems={orderCollectionItems}
          setColumnVisibility={setColumnVisibility}
          setOrderCollectionItems={setOrderCollectionItems}
          setSortCollectionItems={setSortCollectionItems}
          setViewCollectionItems={setViewCollectionItems}
          sortCollectionItems={sortCollectionItems}
          sortedCollectionItems={sortedCollectionItems}
          tagId={tagId}
          viewCollectionItems={viewCollectionItems}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant="albums"
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
            orderCollectionItems={orderCollectionItems}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            tagId={tagId}
            viewCollectionItems={viewCollectionItems}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="albumTagItems"
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
            orderCollectionItems={orderCollectionItems}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            tagId={tagId}
            viewCollectionItems={viewCollectionItems}
          />
        </ViewList>
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
  orderCollectionItems,
  setColumnVisibility,
  setOrderCollectionItems,
  setSortCollectionItems,
  setViewCollectionItems,
  sortCollectionItems,
  sortedCollectionItems,
  tagId,
  viewCollectionItems,
}) => {
  return (
    <TitleHeading
      key={libraryId + '-' + tagId}
      thumb={collectionThumb}
      title={collectionTitle}
      subtitle={
        sortedCollectionItems ? (
          sortedCollectionItems?.length + ' Album' + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      icon={'AlbumTagsIcon'}
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
                  { value: 'artist', label: 'Artist' },
                  { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                  { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                  { value: 'addedAt', label: 'Date added' },
                  { value: 'lastPlayed', label: 'Date played' },
                  { value: 'releaseDate', label: 'Date released' },
                  { value: 'isFavourite', label: 'Favourites' },
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
                    attr: 'gridAlbumCollectionItemsUserRating',
                    checked: gridOptions.userRating,
                  },
                  {
                    label: 'Show favourites',
                    attr: 'gridAlbumCollectionItemsIsFavourite',
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
                  label: 'Artist',
                  attr: 'colCollectionAlbumsArtist',
                  checked: colOptions.artist,
                },
                {
                  label: 'Genre',
                  attr: 'colCollectionAlbumsGenre',
                  checked: colOptions.genre,
                },
                {
                  label: 'Released',
                  attr: 'colCollectionAlbumsReleaseDate',
                  checked: colOptions.releaseDate,
                },
                {
                  label: 'Added',
                  attr: 'colCollectionAlbumsAddedAt',
                  checked: colOptions.addedAt,
                },
                {
                  label: 'Last played',
                  attr: 'colCollectionAlbumsLastPlayed',
                  checked: colOptions.lastPlayed,
                },
                {
                  label: 'Rating',
                  attr: 'colCollectionAlbumsUserRating',
                  checked: colOptions.userRating,
                },
                {
                  label: 'Favourite',
                  attr: 'colCollectionAlbumsIsFavourite',
                  checked: colOptions.isFavourite,
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

export default AlbumTagItems;
