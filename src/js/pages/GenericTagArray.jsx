// ======================================================================
// IMPORTS
// ======================================================================

import { FilterToggle, FilterWrap, ViewGrid, ViewList, Loading, TitleHeading } from 'js/components';
import { useGetCollectionArray } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const GenericTagArray = ({
  collectionKey, // e.g. 'AlbumGenres'
  pageTitle, // e.g. 'Album Genres'
  singularName, // e.g. 'Album Genre'
  variant, // e.g. 'albumGenres'
}) => {
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    setViewCollections,
    setOrderCollections,
    sortedCollections,
  } = useGetCollectionArray(collectionKey);

  const isLoading = !sortedCollections;
  const isEmptyList = !isLoading && sortedCollections?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewCollections === 'grid';
  const isListView = !isLoading && !isEmptyList && viewCollections === 'list';

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          isGridView={isGridView}
          isListView={isListView}
          orderCollections={orderCollections}
          pageTitle={pageTitle}
          setOrderCollections={setOrderCollections}
          setViewCollections={setViewCollections}
          singularName={singularName}
          sortedCollections={sortedCollections}
          viewCollections={viewCollections}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ViewGrid variant={variant} entries={sortedCollections}>
          <Title
            isGridView={isGridView}
            isListView={isListView}
            orderCollections={orderCollections}
            pageTitle={pageTitle}
            setOrderCollections={setOrderCollections}
            setViewCollections={setViewCollections}
            singularName={singularName}
            sortedCollections={sortedCollections}
            viewCollections={viewCollections}
          />
        </ViewGrid>
      )}
      {isListView && (
        <ViewList variant={variant} entries={sortedCollections} sortKey={sortCollections} orderKey={orderCollections}>
          <Title
            isGridView={isGridView}
            isListView={isListView}
            orderCollections={orderCollections}
            pageTitle={pageTitle}
            setOrderCollections={setOrderCollections}
            setViewCollections={setViewCollections}
            singularName={singularName}
            sortedCollections={sortedCollections}
            viewCollections={viewCollections}
          />
        </ViewList>
      )}
    </>
  );
};

const Title = ({
  isGridView,
  isListView,
  orderCollections,
  pageTitle,
  setOrderCollections,
  setViewCollections,
  singularName,
  sortedCollections,
  viewCollections,
}) => {
  return (
    <>
      <TitleHeading
        key={pageTitle.replace(/\s+/g, '')}
        title={pageTitle}
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' ' + singularName + (sortedCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
        padding={!isListView && !isGridView}
      />
      <FilterWrap padding={true} nested={!isListView && !isGridView}>
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

export default GenericTagArray;
