// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterMenu, FilterSelect, FilterToggle, ViewGrid, ViewList, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const GenericTagItems = ({
  collectionFilter, // e.g., 'genreId', 'moodId', 'styleId', 'tagId'
  collectionKey, // e.g., 'ArtistGenres', 'AlbumMoods', etc.
  itemsKey, // e.g., 'ArtistGenreItems', 'AlbumMoodItems', etc.
  singularName, // e.g., 'Artist', 'Album'
  variant, // e.g., 'artists', 'albums'
}) => {
  const { libraryId } = useParams();
  const collectionId = useParams()[collectionFilter];

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
  } = useGetCollectionItems({
    libraryId,
    collectionId,
    collectionFilter,
    collectionKey,
    itemsKey,
  });

  if (!collectionInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  if (collectionInfo?.error404) {
    return <TitleHeading title="Items not found" />;
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
          collectionKey={collectionKey}
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
          singularName={singularName}
          sortCollectionItems={sortCollectionItems}
          sortedCollectionItems={sortedCollectionItems}
          variant={variant}
          viewCollectionItems={viewCollectionItems}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant={variant}
          entries={sortedCollectionItems}
          showFavs={gridOptions.isFavourite}
          showRatings={gridOptions.userRating}
        >
          <Title
            collectionId={collectionId}
            collectionKey={collectionKey}
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
            singularName={singularName}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            variant={variant}
            viewCollectionItems={viewCollectionItems}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant={variant}
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
          colOptions={colOptions}
        >
          <Title
            collectionId={collectionId}
            collectionKey={collectionKey}
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
            singularName={singularName}
            sortCollectionItems={sortCollectionItems}
            sortedCollectionItems={sortedCollectionItems}
            variant={variant}
            viewCollectionItems={viewCollectionItems}
          />
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  collectionId,
  collectionKey,
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
  singularName,
  sortCollectionItems,
  sortedCollectionItems,
  variant,
  viewCollectionItems,
}) => {
  // Auto-generate configurations based on variant and collectionKey
  const icon = `${collectionKey}Icon`;
  const gridStatePrefix = variant === 'artists' ? 'gridArtistCollectionItems' : 'gridAlbumCollectionItems';
  const colStatePrefix = variant === 'artists' ? 'colCollectionArtists' : 'colCollectionAlbums';

  // Define column field configurations based on variant
  const colFields =
    variant === 'artists'
      ? [
          ...(platformOpts?.enableCountry ? [{ label: 'Country', attr: 'Country', key: 'country' }] : []),
          { label: 'Genre', attr: 'Genre', key: 'genre' },
          { label: 'Added', attr: 'AddedAt', key: 'addedAt' },
          { label: 'Last played', attr: 'LastPlayed', key: 'lastPlayed' },
        ]
      : [
          { label: 'Artist', attr: 'Artist', key: 'artist' },
          { label: 'Genre', attr: 'Genre', key: 'genre' },
          { label: 'Released', attr: 'ReleaseDate', key: 'releaseDate' },
          { label: 'Added', attr: 'AddedAt', key: 'addedAt' },
          { label: 'Last played', attr: 'LastPlayed', key: 'lastPlayed' },
        ];

  return (
    <TitleHeading
      key={libraryId + '-' + collectionId}
      thumb={collectionThumb}
      title={collectionTitle}
      subtitle={
        sortedCollectionItems ? (
          sortedCollectionItems?.length + ' ' + singularName + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      icon={icon}
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
                  ...(platformOpts?.enableIsFavourite ? [{ value: 'isFavourite', label: 'Favourites' }] : []),
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
                  ...(platformOpts?.enableIsFavourite
                    ? [
                        {
                          label: 'Show favourites',
                          attr: `${gridStatePrefix}IsFavourite`,
                          checked: gridOptions.isFavourite,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableUserRating
                    ? [
                        {
                          label: 'Show star ratings',
                          attr: `${gridStatePrefix}UserRating`,
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
                ...colFields.map((field) => ({
                  label: field.label,
                  attr: `${colStatePrefix}${field.attr}`,
                  checked: colOptions[field.key],
                })),
                ...(platformOpts?.enableIsFavourite
                  ? [
                      {
                        label: 'Favourite',
                        attr: `${colStatePrefix}IsFavourite`,
                        checked: colOptions.isFavourite,
                      },
                    ]
                  : []),
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        label: 'Rating',
                        attr: `${colStatePrefix}UserRating`,
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

export default GenericTagItems;
