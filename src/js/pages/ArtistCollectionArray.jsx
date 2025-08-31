// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  FilterWrap,
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

const ArtistCollectionArray = () => {
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
  } = useGetCollectionArray('ArtistCollections');

  const isLoading = !sortedCollections;
  const isEmptyList = !isLoading && sortedCollections?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollections === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollections === 'list';

  return (
    <>
      {(isLoading || isEmptyList) && (
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
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid variant="collections" entries={sortedCollections} showRatings={gridOptions.userRating}>
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
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="artistCollections"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
          colOptions={colOptions}
        >
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
        key="ArtistCollectionArray"
        title="Artist Collections"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Artist Collection' + (sortedCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView && !isGridView}
      />
      <FilterWrap padding={!isListView && !isGridView}>
        <FilterToggle
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
            <FilterSelect
              value={sortCollections}
              options={[
                { value: 'title', label: 'Alphabetical' },
                ...(platformOpts?.enableAddedAt ? [{ value: 'addedAt', label: 'Date added' }] : []),
                ...(platformOpts?.enableUserRating ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={setSortCollections}
            />
            <FilterToggle
              value={orderCollections}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderCollections}
              icon={orderCollections === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
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
                        attr: 'gridCollectionsUserRating',
                        checked: gridOptions.userRating,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        )}
        {viewCollections === 'list' && (
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
              ...(platformOpts?.enableAddedAt
                ? [
                    {
                      label: 'Added',
                      attr: 'colCollectionAddedAt',
                      checked: colOptions.addedAt,
                    },
                  ]
                : []),
              ...(platformOpts?.enableUserRating
                ? [
                    {
                      label: 'Rating',
                      attr: 'colCollectionUserRating',
                      checked: colOptions.userRating,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </FilterWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionArray;
