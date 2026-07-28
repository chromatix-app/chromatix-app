// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

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
    optionFoldersOnTop,

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
          optionFoldersOnTop={optionFoldersOnTop}
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
            optionFoldersOnTop={optionFoldersOnTop}
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
            optionFoldersOnTop={optionFoldersOnTop}
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
  optionFoldersOnTop,
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
      <ActionWrap padding={true} inset={isListView || isGridView}>
        <ActionToggle
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
            <ActionSort
              sortValue={sortFolders}
              orderValue={orderFolders}
              options={[
                { value: 'sortOrder', label: 'Default' },
                { value: 'title', label: 'Alphabetical' },
              ]}
              setSort={setSortFolders}
              setOrder={setOrderFolders}
            />
            <ActionMenu
              label="Options"
              icon="CogIcon"
              setter={setColumnVisibility}
              entries={[
                {
                  variant: 'checkbox',
                  label: 'Keep folders on top',
                  attr: 'optionFoldersOnTop',
                  checked: optionFoldersOnTop,
                },
              ]}
            />
          </>
        )}
        {viewFolders === 'list' && (
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
                label: 'Kind',
                attr: 'colFoldersKind',
                checked: colOptions.kind,
              },
              { variant: 'divider' },
              {
                variant: 'checkbox',
                label: 'Keep folders on top',
                attr: 'optionFoldersOnTop',
                checked: optionFoldersOnTop,
              },
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

export default FolderItems;
