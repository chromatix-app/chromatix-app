// ======================================================================
// IMPORTS
// ======================================================================

import { FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistMoodList = () => {
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    setViewCollections,
    setOrderCollections,
    sortedCollections,
  } = useGetAllCollections('ArtistMoods');

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
          setViewCollections={setViewCollections}
          sortedCollections={sortedCollections}
          viewCollections={viewCollections}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && <ListCards variant="artistMoods" entries={sortedCollections} />}
      {isListView && (
        <ListTableV2
          variant="artistMoods"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
        >
          <Title
            isListView={isListView}
            orderCollections={orderCollections}
            setOrderCollections={setOrderCollections}
            setViewCollections={setViewCollections}
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
  setViewCollections,
  sortedCollections,
  viewCollections,
}) => {
  return (
    <>
      <TitleHeading
        key="ArtistMoodList"
        title="Artist Moods"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Artist Mood' + (sortedCollections?.length !== 1 ? 's' : '')
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

export default ArtistMoodList;
