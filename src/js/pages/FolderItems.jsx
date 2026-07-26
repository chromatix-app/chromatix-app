// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import {
  FilterMenu,
  FilterSort,
  FilterToggle,
  FilterWrap,
  ViewGrid,
  ViewList,
  Loading,
  TitleHeading,
} from 'js/components';
import { useGetFolderItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const FolderItems = () => {
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
        <ViewGrid
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
        </ViewGrid>
      )}
      {isListView && (
        <ViewList
          variant="folders"
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
        </ViewList>
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
      <FilterWrap padding={true} inset={isListView || isGridView}>
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
            <FilterSort
              sortValue={sortFolders}
              orderValue={orderFolders}
              options={[
                { value: 'sortOrder', label: 'Default' },
                { value: 'kind', label: 'Kind' },
                { value: 'title', label: 'Title' },
              ]}
              setSort={setSortFolders}
              setOrder={setOrderFolders}
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
                variant: 'checkbox',
                label: 'Title',
                disabled: true,
                checked: true,
              },
              {
                variant: 'checkbox',
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

export default FolderItems;
