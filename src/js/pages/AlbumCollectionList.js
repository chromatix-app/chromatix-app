// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumCollectionList = () => {
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    setViewCollections,
    setSortCollections,
    setOrderCollections,
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
          isListView={isListView}
          orderCollections={orderCollections}
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
        <ListTableV2
          variant="albumCollections"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
        >
          <Title
            isListView={isListView}
            orderCollections={orderCollections}
            setOrderCollections={setOrderCollections}
            setSortCollections={setSortCollections}
            setViewCollections={setViewCollections}
            sortCollections={sortCollections}
            sortedCollections={sortedCollections}
            viewCollections={viewCollections}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  isListView,
  orderCollections,
  setOrderCollections,
  setSortCollections,
  setViewCollections,
  sortCollections,
  sortedCollections,
  viewCollections,
}) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

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
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
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
      </FilterWrap>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionList;
