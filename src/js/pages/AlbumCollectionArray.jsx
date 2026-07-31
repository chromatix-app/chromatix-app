// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  ActionMenu,
  ActionSort,
  ActionToggle,
  ActionWrap,
  ViewGrid,
  ViewList,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetCollectionArray } from 'js/hooks';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumCollectionArray = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const {
    viewCollections,
    sortCollections,
    orderCollections,
    gridOptions,
    colOptions,

    setViewCollections,
    setSortCollections,
    setOrderCollections,
    setColumnVisibility,

    sortedCollections,
  } = useGetCollectionArray('AlbumCollections');

  const isLoading = !sortedCollections;
  const isEmptyList = !isLoading && sortedCollections?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollections === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollections === 'list';

  const titleBlock = (
    <Title
      colOptions={colOptions}
      gridOptions={gridOptions}
      isGridView={isGridView}
      isListView={isListView}
      orderCollections={orderCollections}
      platformOpts={platformOpts}
      setColumnVisibility={setColumnVisibility}
      setOrderCollections={setOrderCollections}
      setSortCollections={setSortCollections}
      setViewCollections={setViewCollections}
      sortCollections={sortCollections}
      sortedCollections={sortedCollections}
      viewCollections={viewCollections}
    />
  );

  return (
    <>
      {(isLoading || isEmptyList) && titleBlock}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid
          variant="collections"
          entries={sortedCollections}
          showTotalItems={gridOptions.totalItems}
          showRatings={gridOptions.userRating}
        >
          {titleBlock}
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="albumCollections"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
          colOptions={colOptions}
        >
          {titleBlock}
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  gridOptions,
  isGridView,
  isListView,
  orderCollections,
  platformOpts,
  setColumnVisibility,
  setOrderCollections,
  setSortCollections,
  setViewCollections,
  sortCollections,
  sortedCollections,
  viewCollections,
}) => {
  return (
    <>
      <TitleHeading
        key="AlbumCollectionArray"
        title="Album Collections"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Album Collection' + (sortedCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView && !isGridView}
      />
      <ActionWrap padding={true} inset={isListView || isGridView}>
        <ActionToggle
          value={viewCollections}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewCollections}
          icon={viewCollections === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewCollections === 'grid' && (
          <>
            <ActionSort
              sortValue={sortCollections}
              orderValue={orderCollections}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'totalItems', label: 'Total albums' },
                ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setSort={setSortCollections}
              setOrder={setOrderCollections}
            />
            <ActionMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  variant: 'checkbox',
                  label: 'Show total albums',
                  attr: 'gridAlbumCollectionsTotalItems',
                  checked: gridOptions.totalItems,
                },
                ...(platformOpts?.enableUserRating
                  ? [
                      {
                        variant: 'checkbox',
                        label: 'Show star ratings',
                        attr: 'gridAlbumCollectionsUserRating',
                        checked: gridOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        )}
        {viewCollections === 'list' && (
          <ActionMenu
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
              {
                variant: 'checkbox',
                label: 'Total albums',
                attr: 'colAlbumCollectionsTotalItems',
                checked: colOptions.totalItems,
              },
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Added',
                      attr: 'colAlbumCollectionsAddedAt',
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      variant: 'checkbox',
                      label: 'Rating',
                      attr: 'colAlbumCollectionsUserRating',
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </ActionWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionArray;
