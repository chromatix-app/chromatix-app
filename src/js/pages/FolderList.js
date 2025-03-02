// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTableV2, Loading, TitleHeading } from 'js/components';
import { useGetFolderItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const FolderList = () => {
  const { folderId = 'root' } = useParams();

  const {
    viewFolders,
    sortFolders,
    orderFolders,

    setViewFolders,
    setSortFolders,
    setOrderFolders,

    sortedFolders,
    folderOrder,
  } = useGetFolderItems(folderId);

  const isLoading = !sortedFolders;
  const isEmptyList = !isLoading && sortedFolders?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewFolders === 'grid';
  const isListView = !isLoading && !isEmptyList && viewFolders === 'list';

  return (
    <>
      {(isLoading || isEmptyList || isGridView) && (
        <Title
          folderId={folderId}
          isListView={isListView}
          orderFolders={orderFolders}
          setOrderFolders={setOrderFolders}
          setSortFolders={setSortFolders}
          setViewFolders={setViewFolders}
          sortedFolders={sortedFolders}
          sortFolders={sortFolders}
          viewFolders={viewFolders}
        />
      )}
      {isLoading && <Loading forceVisible inline showOffline />}
      {isGridView && (
        <ListCards
          variant="folders"
          folderId={folderId}
          entries={sortedFolders}
          playingOrder={folderOrder}
          sortKey={sortFolders}
        />
      )}
      {isListView && (
        <ListTableV2
          variant={'folders'}
          folderId={folderId}
          entries={sortedFolders}
          playingOrder={folderOrder}
          sortKey={sortFolders}
          orderKey={orderFolders}
        >
          <Title
            folderId={folderId}
            isListView={isListView}
            orderFolders={orderFolders}
            setOrderFolders={setOrderFolders}
            setSortFolders={setSortFolders}
            setViewFolders={setViewFolders}
            sortedFolders={sortedFolders}
            sortFolders={sortFolders}
            viewFolders={viewFolders}
          />
        </ListTableV2>
      )}
    </>
  );
};

const Title = ({
  folderId,
  isListView,
  orderFolders,
  setOrderFolders,
  setSortFolders,
  setViewFolders,
  sortedFolders,
  sortFolders,
  viewFolders,
}) => {
  return (
    <>
      <TitleHeading
        key={'folder-' + folderId}
        title="Folders"
        subtitle={
          sortedFolders ? sortedFolders?.length + ' Item' + (sortedFolders?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
        padding={!isListView}
      />
      <FilterWrap padding={!isListView}>
        <FilterToggle
          value={viewFolders}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewFolders}
          icon={viewFolders === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewFolders === 'grid' && (
          <>
            <FilterSelect
              value={sortFolders}
              options={[
                { value: 'sortOrder', label: 'Default' },
                { value: 'title', label: 'Title' },
                { value: 'kind', label: 'Kind' },
              ]}
              setter={setSortFolders}
            />
            <FilterToggle
              value={orderFolders}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderFolders}
              icon={orderFolders === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
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

export default FolderList;
