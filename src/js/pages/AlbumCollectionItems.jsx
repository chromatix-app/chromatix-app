// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  ViewGrid,
  ViewList,
  Loading,
  StarRating,
  TitleHeading,
} from 'js/components';
import { useGetCollectionItems } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumCollectionItems = () => {
  const { libraryId, collectionId } = useParams();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

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
    collectionRating,
  } = useGetCollectionItems({
    libraryId,
    collectionId,
    collectionKey: 'AlbumCollections',
    itemsKey: 'AlbumCollectionItems',
  });

  if (!collectionInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  if (collectionInfo?.error404) {
    return <TitleHeading title="Collection not found" />;
  }

  const isLoading = !sortedCollectionItems;
  const isEmptyList = !isLoading && sortedCollectionItems?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollectionItems === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollectionItems === 'list';

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          collectionId={collectionId}
          collectionRating={collectionRating}
          collectionThumb={collectionThumb}
          collectionTitle={collectionTitle}
          colOptions={colOptions}
          gridOptions={gridOptions}
          isGridView={isGridView}
          isListView={isListView}
          libraryId={libraryId}
          orderCollectionItems={orderCollectionItems}
          platformOpts={platformOpts}
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
        <ViewGrid variant="albums" entries={sortedCollectionItems} showRatings={gridOptions.userRating}>
          <Title
            collectionId={collectionId}
            collectionRating={collectionRating}
            collectionThumb={collectionThumb}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            libraryId={libraryId}
            orderCollectionItems={orderCollectionItems}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            viewCollectionItems={viewCollectionItems}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="albumCollectionItems"
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
          colOptions={colOptions}
        >
          <Title
            collectionId={collectionId}
            collectionRating={collectionRating}
            collectionThumb={collectionThumb}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            gridOptions={gridOptions}
            isGridView={isGridView}
            isListView={isListView}
            libraryId={libraryId}
            orderCollectionItems={orderCollectionItems}
            platformOpts={platformOpts}
            setColumnVisibility={setColumnVisibility}
            setOrderCollectionItems={setOrderCollectionItems}
            setSortCollectionItems={setSortCollectionItems}
            setViewCollectionItems={setViewCollectionItems}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            viewCollectionItems={viewCollectionItems}
          />
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  collectionId,
  collectionRating,
  collectionThumb,
  collectionTitle,
  colOptions,
  gridOptions,
  isGridView,
  isListView,
  libraryId,
  orderCollectionItems,
  platformOpts,
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
      key={libraryId + '-' + collectionId}
      thumb={collectionThumb}
      title={collectionTitle}
      detail={
        // Note: if adding fields here in future, use array structure as per AlbumDetail etc
        <>
          {platformOpts.enableUserRating && (
            <StarRating variant="title" type="collection" ratingKey={collectionId} rating={collectionRating} editable />
          )}
        </>
      }
      subtitle={
        sortedCollectionItems ? (
          sortedCollectionItems?.length + ' Album' + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
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
                  ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
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
                  ...(platformOpts?.enableUserRating
                    ? [
                        {
                          label: 'Show star ratings',
                          attr: 'gridAlbumCollectionItemsUserRating',
                          checked: gridOptions.userRating,
                        },
                      ]
                    : []),
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
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        label: 'Rating',
                        attr: 'colCollectionAlbumsUserRating',
                        checked: colOptions.userRating,
                      },
                    ]
                  : []),
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

export default AlbumCollectionItems;
