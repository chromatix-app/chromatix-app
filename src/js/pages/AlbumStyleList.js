// ======================================================================
// IMPORTS
// ======================================================================

import { FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumStyleList = () => {
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    setViewCollections,
    setOrderCollections,
    sortedCollections,
  } = useGetAllCollections('AlbumStyles');

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
      {isGridView && <ListCards variant="albumStyles" entries={sortedCollections} />}
      {isListView && (
        <ListTableV2
          variant="albumStyles"
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
        key="AlbumStyleList"
        title="Album Styles"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Album Style' + (sortedCollections?.length !== 1 ? 's' : '')
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

export default AlbumStyleList;
