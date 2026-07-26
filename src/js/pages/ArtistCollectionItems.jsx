// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  ActionMenu,
  ActionSort,
  ActionToggle,
  ViewGrid,
  ViewList,
  Loading,
  StarRating,
  TitleHeading,
} from 'js/components';
import { useContextMenuCollections, useGetCollectionItems } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionItems = () => {
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
    collectionThumbMedium,
    collectionTitle,
    collectionRating,
  } = useGetCollectionItems({
    collectionId,
    libraryId,
    collectionKey: 'ArtistCollections',
    itemsKey: 'ArtistCollectionItems',
  });

  const contextEntries = useContextMenuCollections(
    collectionInfo && !collectionInfo?.error404
      ? { collectionId, collectionTitle: collectionInfo.title, collectionType: 'artist' }
      : null
  );

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
          collectionThumbMedium={collectionThumbMedium}
          collectionTitle={collectionTitle}
          colOptions={colOptions}
          contextEntries={contextEntries}
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
        <ViewGrid
          variant="artists"
          collectionId={collectionId}
          entries={sortedCollectionItems}
          showRatings={gridOptions.userRating}
        >
          <Title
            collectionId={collectionId}
            collectionRating={collectionRating}
            collectionThumb={collectionThumb}
            collectionThumbMedium={collectionThumbMedium}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            contextEntries={contextEntries}
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
            viewCollectionItems={viewCollectionItems}
            platformOpts={platformOpts}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="artistCollectionItems"
          collectionId={collectionId}
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
          colOptions={colOptions}
        >
          <Title
            collectionId={collectionId}
            collectionRating={collectionRating}
            collectionThumb={collectionThumb}
            collectionThumbMedium={collectionThumbMedium}
            collectionTitle={collectionTitle}
            colOptions={colOptions}
            contextEntries={contextEntries}
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
            viewCollectionItems={viewCollectionItems}
            platformOpts={platformOpts}
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
  collectionThumbMedium,
  collectionTitle,
  colOptions,
  contextEntries,
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
      thumbExpand={collectionThumbMedium}
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
          sortedCollectionItems?.length + ' Artist' + (sortedCollectionItems?.length !== 1 ? 's' : '')
        ) : (
          <>&nbsp;</>
        )
      }
      padding={!isListView && !isGridView}
      optionsMenu={
        <>
          <div className="actionIconWrap">
            <ActionToggle
              variant="Large"
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
                <ActionSort
                  variant="Large"
                  sortValue={sortCollectionItems}
                  orderValue={orderCollectionItems}
                  options={[
                    { value: 'title', label: 'Alphabetical' },
                    ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                    ...(platformOpts?.enableLastPlayed ? [{ value: 'lastPlayed', label: 'Date played' }] : []),
                    ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
                  ]}
                  setSort={setSortCollectionItems}
                  setOrder={setOrderCollectionItems}
                />
                <ActionMenu
                  variant="Large"
                  label="Options"
                  icon="CogIcon"
                  setter={setColumnVisibility}
                  entries={[
                    ...(platformOpts?.enableUserRating
                      ? [
                          {
                            variant: 'checkbox',
                            label: 'Show star ratings',
                            attr: 'gridArtistCollectionItemsUserRating',
                            checked: gridOptions.userRating,
                          },
                        ]
                      : []),
                  ]}
                />
              </>
            )}
            {viewCollectionItems === 'list' && (
              <ActionMenu
                variant="Large"
                label="Options"
                icon="CogIcon"
                setter={setColumnVisibility}
                entries={[
                  {
                    variant: 'checkbox',
                    label: 'Title',
                    disabled: true,
                    checked: true,
                  },
                  ...(platformOpts?.enableCountry
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Country',
                          attr: 'colCollectionArtistsCountry',
                          checked: colOptions.country,
                        },
                      ]
                    : []),
                  {
                    variant: 'checkbox',
                    label: 'Genre',
                    attr: 'colCollectionArtistsGenre',
                    checked: colOptions.genre,
                  },
                  ...(platformOpts?.enableAddedAt
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Added',
                          attr: 'colCollectionArtistsAddedAt',
                          checked: colOptions.addedAt,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableLastPlayed
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Last played',
                          attr: 'colCollectionArtistsLastPlayed',
                          checked: colOptions.lastPlayed,
                        },
                      ]
                    : []),
                  ...(platformOpts?.enableUserRating
                    ? [
                        {
                          variant: 'checkbox',
                          label: 'Rating',
                          attr: 'colCollectionArtistsUserRating',
                          checked: colOptions.userRating,
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>
          <div className="actionIconWrap">
            <ActionMenu variant="Large" label="More" icon="EllipsisIcon" entries={contextEntries} />
          </div>
        </>
      }
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionItems;
