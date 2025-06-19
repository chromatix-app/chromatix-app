// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

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
    colOptions,

    setViewFolders,
    setSortFolders,
    setOrderFolders,
    setColumnVisibility,

    sortedFolders,
    folderOrder,
  } = useGetFolderItems(folderId);

  const isLoading = !sortedFolders;
  const isEmptyList = !isLoading && sortedFolders?.length === 0;
  const isGridView = !isLoading && !isEmptyList && viewFolders === 'grid';
  const isListView = !isLoading && !isEmptyList && viewFolders === 'list';

  return (
    <>
      {(isLoading || isEmptyList) && (
        <Title
          colOptions={colOptions}
          folderId={folderId}
          isGridView={isGridView}
          isListView={isListView}
          orderFolders={orderFolders}
          setColumnVisibility={setColumnVisibility}
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
        >
          <Title
            colOptions={colOptions}
            folderId={folderId}
            isGridView={isGridView}
            isListView={isListView}
            orderFolders={orderFolders}
            setColumnVisibility={setColumnVisibility}
            setOrderFolders={setOrderFolders}
            setSortFolders={setSortFolders}
            setViewFolders={setViewFolders}
            sortedFolders={sortedFolders}
            sortFolders={sortFolders}
            viewFolders={viewFolders}
          />
        </ListCards>
      )}
      {isListView && (
        <ListTable
          variant={'folders'}
          folderId={folderId}
          entries={sortedFolders}
          playingOrder={folderOrder}
          sortKey={sortFolders}
          orderKey={orderFolders}
          colOptions={colOptions}
        >
          <Title
            colOptions={colOptions}
            folderId={folderId}
            isGridView={isGridView}
            isListView={isListView}
            orderFolders={orderFolders}
            setColumnVisibility={setColumnVisibility}
            setOrderFolders={setOrderFolders}
            setSortFolders={setSortFolders}
            setViewFolders={setViewFolders}
            sortedFolders={sortedFolders}
            sortFolders={sortFolders}
            viewFolders={viewFolders}
          />
        </ListTable>
      )}
    </>
  );
};

const Title = ({
  colOptions,
  folderId,
  isGridView,
  isListView,
  orderFolders,
  setColumnVisibility,
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
        padding={!isListView && !isGridView}
      />
      <FilterWrap padding={!isListView && !isGridView}>
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
                { value: 'kind', label: 'Kind' },
                { value: 'title', label: 'Title' },
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
        {viewFolders === 'list' && (
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
              {
                label: 'Kind',
                attr: 'colFoldersKind',
                checked: colOptions.kind,
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

export default FolderList;
