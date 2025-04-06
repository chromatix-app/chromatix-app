// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import {
  FilterMenu,
  FilterSelect,
  FilterToggle,
  FilterWrap,
  ListCards,
  ListTable,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumCollectionList = () => {
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    colOptions,

    setViewCollections,
    setSortCollections,
    setOrderCollections,
    setColumnVisibility,

    sortedCollections,
  } = useGetAllCollections('AlbumCollections');

  const isLoading = !sortedCollections;
  const isEmptyList = !isLoading && sortedCollections?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollections === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollections === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          colOptions={colOptions}
          isListView={isListView}
          orderCollections={orderCollections}
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
      {isGridView && <ListCards variant="collections" entries={sortedCollections} />}
      {isListView && (
        <ListTable
          variant="albumCollections"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
            isListView={isListView}
            orderCollections={orderCollections}
            setColumnVisibility={setColumnVisibility}
            setOrderCollections={setOrderCollections}
            setSortCollections={setSortCollections}
            setViewCollections={setViewCollections}
            sortCollections={sortCollections}
            sortedCollections={sortedCollections}
            viewCollections={viewCollections}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  isListView,
  orderCollections,
  setColumnVisibility,
  setOrderCollections,
  setSortCollections,
  setViewCollections,
  sortCollections,
  sortedCollections,
  viewCollections,
}) => {
  const optionShowStarRatings_Deprecated = useSelector(
    ({ sessionModel }) => sessionModel.optionShowStarRatings_Deprecated
  );

  return (
    <>
      <TitleHeading
        key="AlbumCollectionList"
        title="Album Collections"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Album Collection' + (sortedCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView}
      />
      <FilterWrap padding={!isListView}>
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
                { value: 'addedAt', label: 'Date added' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings_Deprecated ? [{ value: 'userRating', label: 'Rating' }] : []),
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
          </>
        )}
        {viewCollections === 'list' && (
          <FilterMenu
            label="Options"
            icon="EllipsisCircleIcon"
            setter={setColumnVisibility}
            entries={[
              {
                label: 'Title',
                disabled: true,
                checked: true,
              },
              {
                label: 'Added',
                attr: 'colCollectionAddedAt',
                checked: colOptions.addedAt,
              },
              {
                label: 'Rating',
                attr: 'colCollectionUserRating',
                checked: colOptions.userRating,
              },
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

export default AlbumCollectionList;
